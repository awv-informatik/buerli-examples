import { ApiHistory, ApiNoHistory } from '@buerli.io/headless'
import produce from 'immer'
import create, { SetState } from 'zustand'

export type ParamType = Record<string, number>
export type apiType = ApiHistory | ApiNoHistory
export enum Api {
  NOHISTORY = 0,
  HISTORY = 1
}

const toc: { label: string; file: string }[] = [
  { label: 'CreatePart', file: 'history/CreatePart_Example' },
  // { label: 'CreateAsm_Example', file: 'CreateAsm_Example' },
  // { label: 'As1_Assembly', file: 'As1_Assembly' },
  // { label: 'FlangeWithExpressions_Example', file: 'FlangeWithExpressions_Example' },
  // { label: 'LBracket_Assembly', file: 'LBracket_Assembly' },
  // { label: 'Nut-Bolt_Assembly', file: 'Nut-Bolt_Assembly' },
  // { label: 'ShadowboxWithExpressions_Example', file: 'ShadowboxWithExpressions_Example' },
  // { label: 'Gripper_Example', file: 'Gripper_Example' },
  { label: 'fish', file: 'solid/fish' },
  { label: 'heart', file: 'solid/heart' },
  { label: 'FlangePart', file: 'history/FlangePrt' },
  { label: 'FlangeAsm', file: 'history/FlangeAsm' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const example = require(`../models/${t.file}`)
  exampleMap[t.label] = {
    label: t.label,
    // create: example.create,
    // update: example.update,
    text: import(`!!raw-loader!../models/${t.file}.ts`),
    // params: example.paramsMap,
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

export type Example = {
  label: string
  create?: (api: apiType, params?: any) => any
  update?: (api: apiType, partId: number, params?: ParamType) => any
  getScene?: (productOrSolidId: number, api: apiType) => any
  getBufferGeom?: (productOrSolidId: number, api: apiType) => any
  text?: Promise<{ default: any }>
  params?: ParamType
  apiType?: Api
}
