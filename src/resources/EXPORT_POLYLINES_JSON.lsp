t(defun transform-point (pt /)
  ;; Return raw point as-is
  (list (car pt) (cadr pt) 0.0)
)
(defun format-polyline-json (plines / result pl points bulges normal closed pointStr bulgeStr normalStr)
  (setq result "")
  (foreach pl plines
    (setq points (car pl))
    (setq bulges (cadr pl))
    (setq normal (caddr pl))
    (setq closed (cadddr pl))

    (setq pointStr
      (apply 'strcat
        (intersperse
          (mapcar
            '(lambda (pt)
               (strcat "[" (rtos (car pt) 2 4) "," (rtos (cadr pt) 2 4) "," (rtos (caddr pt) 2 4) "]"))
            points)
          ","
        )
      )
    )

    (setq bulgeStr
      (apply 'strcat
        (intersperse
          (mapcar '(lambda (b) (rtos b 2 4)) bulges)
          ","
        )
      )
    )

    (setq normalStr
      (apply 'strcat
        (intersperse
          (mapcar '(lambda (n) (rtos n 2 4)) normal)
          ","
        )
      )
    )

    (setq result
      (strcat result
        (if (> (strlen result) 0) "," "")
        "{\"points\": [" pointStr "], \"bulges\": [" bulgeStr "], \"normal\": [" normalStr "], \"closed\": " (if closed "true" "false") "}"
      )
    )
  )
  result
)


(defun intersperse (lst sep / result)
  (setq result '())
  (foreach x lst
    (setq result (append result (if result (list sep)) (list x)))
  )
  result
)

(defun get-block-polylines (blkEnt / plines entData blkname blkdef ent typ points bulges closed normal pair)
  (prompt "\n[TRACE] Extracting original polylines from block definition...")
  (setq plines '())
  (setq entData (entget blkEnt))
  (setq blkname (cdr (assoc 2 entData)))
  (setq blkdef (tblobjname "BLOCK" blkname))

  ;; Guard against nil blkdef
  (if blkdef
    (progn
      (setq ent (entnext blkdef))
      (while ent
        (setq entData (entget ent))
        (setq typ (cdr (assoc 0 entData)))
        (if (eq typ "LWPOLYLINE")
          (progn
            (setq points '())
            (setq bulges '())
            (setq closed (= 1 (logand 1 (cdr (assoc 70 entData)))))
            
            (setq normal (cdr (assoc 210 entData)))
            (foreach pair entData
              (cond
                ((= (car pair) 10)
                 (setq points (append points (list (transform-point (cdr pair)))))
                )
                ((= (car pair) 42)
                 (setq bulges (append bulges (list (cdr pair)))))
              )
            )
            (while (< (length bulges) (length points))
              (setq bulges (append bulges (list 0))))
            (if (and closed points)
                (progn
                    (setq points (append points (list (car points))))
                    (setq bulges (append bulges (list 0)))
                )
            )
            (setq plines (append plines (list (list points bulges normal closed))))
          )
        )
        (setq ent (entnext ent))
      )
    )
  )
  plines
)

(defun c:EXPORT_POLYLINES_JSON ( / folder ss i ent blkname plines f path filename profileStrings result)
  (setq folder (getstring "\nEnter export folder path (e.g., C:/tmp): "))
  (setq ss (ssget '((0 . "INSERT"))))
  (if ss
    (progn
      (setq i 0)
      (repeat (sslength ss)
        (setq ent (ssname ss i))
        (setq blkname (cdr (assoc 2 (entget ent))))
        (setq plines (get-block-polylines ent))
        (setq path (strcat folder "/" blkname ".json"))
        (setq f (open path "w"))
        (if f
          (progn
            (write-line (strcat "{\"name\": \"" blkname "\", \"PLines\": [" (format-polyline-json plines) "]}") f)
            (close f)
            (prompt (strcat "\nExported block " blkname " to: " path))
          )
          (prompt (strcat "\n[ERROR] Failed to open file: " path))
        )
        (setq i (1+ i))
      )
    )
    (prompt "\nNo block references selected."))
  (princ)
)
