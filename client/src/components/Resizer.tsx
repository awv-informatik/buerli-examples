import React, { Dispatch, SetStateAction } from 'react'

type ResizeSetter = Dispatch<SetStateAction<number>>
type ResizeStore = [number, ResizeSetter]

export const useResizeStore = (initialValue: number | (() => number)): ResizeStore => {
  return React.useState<number>(typeof initialValue === 'function' ? initialValue() : initialValue)
}

export const Resizer: React.FC<{
  style?: React.CSSProperties
  xStore?: ResizeStore
  xRange?: { min: number; max: number }
  xDir?: '+' | '-'
  yStore?: ResizeStore
  yDir?: '+' | '-'
  yRange?: { min: number; max: number }
}> = props => {
  const { style, xStore, xRange, xDir = '+', yStore, yRange, yDir = '+' } = props

  const checkSize = (size: number, range?: { min: number; max: number }): number => {
    return range ? (size < range.min ? range.min : size > range.max ? range.max : size) : size
  }

  const handleMove = React.useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      if (xStore) {
        xStore[1](x =>
          checkSize(x + (e.movementX / window.devicePixelRatio) * (xDir === '+' ? 1 : -1), xRange),
        )
      }
      if (yStore) {
        yStore[1](y =>
          checkSize(y + (e.movementY / window.devicePixelRatio) * (yDir === '+' ? 1 : -1), yRange),
        )
      }
    },
    [xDir, xRange, xStore, yDir, yRange, yStore],
  )

  const handleUp = React.useCallback(
    (e?: MouseEvent) => {
      e?.preventDefault()
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    },
    [handleMove],
  )

  const handleDown = React.useCallback(
    (down: React.MouseEvent<HTMLDivElement>) => {
      down.preventDefault()
      if (down.nativeEvent.which === 1) {
        window.addEventListener('mousemove', handleMove)
        window.addEventListener('mouseup', handleUp)
      }
      return () => handleUp()
    },
    [handleMove, handleUp],
  )

  return (
    <div
      style={{
        ...{
          cursor: 'e-resize',
          position: 'absolute',
          top: 0,
          right: '0px',
          background: 'transparent',
          height: '100%',
          width: '10px',
          zIndex: 10000,
        },
        ...style,
      }}
      onMouseDown={handleDown}>
      {props.children}
    </div>
  )
}
