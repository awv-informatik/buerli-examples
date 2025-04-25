import { DrawingID, getDrawing, SelectedItem, SelectorID } from "@buerli.io/core"
import { v4 } from "uuid"
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import createPromise from 'flat-promise'

type CustomSelect<T> = (
  resolve: (result: T) => Promise<T>,
  newItems: SelectedItem[],
  diff: SelectedItem[],
) => void

export async function waitForSelect<T>(drawingId: DrawingID, length: number, filter: any, onChange: CustomSelect<T>) {
  const id = v4()
  const selApi = drawingId && getDrawing(drawingId).api.selection

  // Set up selection API
  const { promise, resolve } = createPromise()
  const change = (selId: SelectorID, items: SelectedItem<any>[], diff: SelectedItem<any>[]) => {
    selApi && selApi.setItems(selId, items)
    if (onChange) onChange(resolve, items, diff)
  }
  const unsub = selApi && selApi.createSelector(id, filter, false, [], length, change, change)

  // Wait for user interaction
  selApi && selApi.activateSelector(id)
  const result = await promise

  // Unsubscribe from all selections
  unsub && unsub()
  selApi && selApi.activateSelector(null)
  return result as SelectedItem[]
}
