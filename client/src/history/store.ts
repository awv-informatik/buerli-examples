import { ApiHistory } from '@buerli.io/headless'
import create, { SetState } from 'zustand'

const toc: { label: string; file: string }[] = [
  { label: 'CreatePart_Example', file: 'CreatePart_Example' },
  { label: 'CreateAsm_Example', file: 'CreateAsm_Example' },
  { label: 'As1_Assembly', file: 'As1_Assembly' },
  { label: 'FlangeWithExpressions_Example', file: 'FlangeWithExpressions_Example' },
  { label: 'LBracket_Assembly', file: 'LBracket_Assembly' },
  { label: 'Nut-Bolt_Assembly', file: 'Nut-Bolt_Assembly' },
  { label: 'ShadowboxWithExpressions_Example', file: 'ShadowboxWithExpressions_Example' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  exampleMap[t.label] = {
    label: t.label,
    create: require(`./models/${t.file}`).create,
    text: import(`!!raw-loader!./models/${t.file}.ts`),
  }
}

const useStore = create<State>(set => ({
  activeExample: toc[0].label,
  examples: { ids: Object.keys(exampleMap), objs: exampleMap },
  set,
}))

export { useStore }

// *****************************************
// *****************************************
// TYPES

type State = Readonly<{
  activeExample?: string
  examples: { ids: string[]; objs: Record<string, Example> }
  loading?: boolean
  set: SetState<State>
}>

type Example = {
  label: string
  create?: (api: ApiHistory, param: any) => any
  text?: Promise<{ default: any }>
}
