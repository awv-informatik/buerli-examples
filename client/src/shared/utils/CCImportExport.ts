import { ccAPI } from '@buerli.io/classcad'
import {
  api as buerliApi,
  DrawingID,
  GeometryBounds,
  getDrawing,
  IGraphicPackage,
  IStructureTree,
} from '@buerli.io/core'
import { getCamera } from '@buerli.io/react'

export const CCImportExport = {
  createAndLoad1: (name: string, content: any): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const drawingId = await ccAPI.base.createCCDrawing(name)
        if (drawingId) {
          await ccAPI.baseModeler.load(drawingId, new File([], name), content)
        }
        resolve(undefined)
      } catch (error) {
        reject(error)
      }
    })
  },

  createAndLoad: (file: File): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const drawingId = await ccAPI.base.createCCDrawing(file.name)
        if (drawingId) {
          await CCImportExport.load(drawingId, file)
        }
        resolve(undefined)
      } catch (error) {
        reject(error)
      }
    })
  },

  load: (drawingId: DrawingID, file: File, progress?: (type: 'LOADING' | 'DONE') => void): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        const api = getDrawing(drawingId).api
        const isBli = file.name.indexOf('.bli') === file.name.length - 4
        const reader = new FileReader()
        reader.onload = async () => {
          progress && progress('LOADING')
          try {
            const unsub = buerliApi.subscribe<GeometryBounds>(
              bounds => {
                if (!bounds) return
                getCamera(drawingId)?.actions.setOrientation('iso', bounds)
                getCamera(drawingId)?.actions.setZoom('fit', bounds)
              },
              state => state.drawing.refs[drawingId].geometry.bounds,
            )
            if (isBli) {
              if (typeof reader.result === 'string') {
                const data = JSON.parse(reader.result)
                if (data && data.structure && data.graphic) {
                  api.setStructure(data.structure)
                  api.addGraphicPackages(data.graphic)
                }
              }
            } else {
              await ccAPI.baseModeler.load(drawingId, file, reader.result as ArrayBuffer)
            }
            unsub()
            resolve(undefined)
          } catch (error) {
            reject(error)
          }
          progress && progress('DONE')
        }
        isBli ? reader.readAsText(file) : reader.readAsArrayBuffer(file)
      } catch (error) {
        reject(error)
      }
    })
  },

  save: (drawingId: DrawingID, type: 'of1' | 'stp' | 'bli' = 'of1'): Promise<any> => {
    return new Promise(async (resolve, reject) => {
      try {
        let data = null
        switch (type) {
          case 'of1':
          case 'stp':
            data = await ccAPI.common.save(drawingId, type)
            break
          case 'bli':
            const drawing = getDrawing(drawingId)
            const containers = Object.getOwnPropertyNames(drawing.graphic.containers).map(
              id => drawing.graphic.containers[id as any],
            )
            const toExport: { structure: IStructureTree; graphic: IGraphicPackage[] } = {
              structure: (drawing.structure as never) as IStructureTree,
              graphic: [{ containers, properties: { version: 0 } }],
            }
            data = JSON.stringify(toExport, null, 0)
            break
          default:
            break
        }
        if (data) {
          const link = document.createElement('a')
          link.href = window.URL.createObjectURL(new Blob([data], { type: 'application/octet-stream' }))
          link.download = `drawing.${type}`
          link.click()
        }
        resolve(undefined)
      } catch (error) {
        reject(error)
      }
    })
  },
}
