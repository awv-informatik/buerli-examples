import { ApiHistory, ApiNoHistory, history, solid } from '@buerli.io/headless'
import produce from 'immer'
import create, { SetState } from 'zustand'

const toc: { label: string; file: string }[] = [
  { label: 'CreatePart', file: 'history/CreatePart_Example' },
  { label: 'As1_Assembly', file: 'history/As1_Assembly' },
  { label: 'Nut-Bolt_Assembly', file: 'history/Nut-Bolt_Assembly' },
  { label: 'Gripper_Example', file: 'history/Gripper_Example' },
  { label: 'fish', file: 'solid/fish' },
  { label: 'heart', file: 'solid/heart' },
  { label: 'FlangePart', file: 'history/FlangePrt' },
  { label: 'FlangeAsm', file: 'history/FlangeAsm' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const example = require(`./models/${t.file}`)
  exampleMap[t.label] = {
    label: t.label,
    text: import(`!!raw-loader!./models/${t.file}.ts`),
    ...example
  }
}

const useStore = create<State>(set => ({
  activeExample: toc[0].label,
  examples: { ids: Object.keys(exampleMap), objs: exampleMap },
  set,
  setParam: (exampleId: string, paramName: string, paramValue: number) => {
    set(state => produce(state, draft => void (draft.examples.objs[exampleId].params[paramName] = paramValue)))
  },
}))

export { useStore }

// *****************************************
// *****************************************
// TYPES

type State = Readonly<{
  activeExample: string
  examples: { ids: string[]; objs: Record<string, Example> }
  loading?: boolean
  set: SetState<State>
  setParam: (exampleId: string, paramName: string, paramValue: number) => void
}>

export type ParamType = Record<string, number>
export type Create = (api: ApiHistory | ApiNoHistory, params?: any) => Promise<number>

export type Example = {
  label: string
  create: Create
  update?: (api: ApiHistory | ApiNoHistory, partId: number, params?: ParamType) => any
  getScene?: (productOrSolidId: number, api: ApiHistory | ApiNoHistory) => any
  getBufferGeom?: (productOrSolidId: number, api: ApiHistory | ApiNoHistory) => any
  text?: Promise<{ default: any }>
  params?: ParamType
  cad?: history | solid
}


