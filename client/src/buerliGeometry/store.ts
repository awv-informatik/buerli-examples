import { ApiHistory } from '@buerli.io/headless'
import produce from 'immer'
import create, { SetState } from 'zustand'

const toc: { label: string; file: string }[] = [
  { label: 'Flange_Part', file: 'FlangePrt' },
  { label: 'Flange_Asm', file: 'FlangeAsm' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const example = require(`./models/${t.file}`)
  exampleMap[t.label] = {
    label: t.label,
    create: example.create,
    update: example.update,
    text: import(`!!raw-loader!./models/${t.file}.ts`),
    params: example.paramsMap,
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
  create?: (api: ApiHistory) => any
  update?: (api: ApiHistory, partId: number, params?: ParamType) => any
  text?: Promise<{ default: any }>
  params?: ParamType
}

export type ParamType = Record<string, number>
