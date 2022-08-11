import { ApiHistory, ApiNoHistory, history, solid } from '@buerli.io/headless'
import produce from 'immer'
import create, { SetState } from 'zustand'
import vanillaCreate from 'zustand/vanilla'

// eslint-disable-next-line no-shadow
export enum ParamType {
  Number = 0,
  Checkbox = 1,
  Enum = 2,
  Slider = 3,
  Dropdown = 4,
  Button = 5,
}
export type Param = {
  index: number
  name: string
  type: ParamType
  value: any
  step?: any
  values?: any[]
}
export type Create = (
  api: ApiHistory | ApiNoHistory,
  params?: { lastUpdatedParam: number; values: any[] },
  options?: any,
) => Promise<number>
export type Update = (
  api: ApiHistory | ApiNoHistory,
  productId: number,
  params?: { lastUpdatedParam: number; values: any[] },
) => Promise<number>

const toc: { exampleId: string; label: string; file: string }[] = [
  // solid example
  { exampleId: 'Fish', label: 'Fish', file: 'solid/fish' },
  { exampleId: 'Heart', label: 'Heart', file: 'solid/heart' },
  { exampleId: 'Lego', label: 'Lego Configurator', file: 'solid/lego' },
  { exampleId: 'StepImport', label: 'Step Import', file: 'solid/import-step' },
  { exampleId: 'Whiffleball', label: 'Whiffleball', file: 'solid/whiffleball' },
  { exampleId: 'Profile', label: 'Profile', file: 'solid/Profile' },
  { exampleId: 'Hackathon', label: 'Hackathon', file: 'solid/hackathon' },
  { exampleId: 'Mechanical', label: 'Mechanical', file: 'solid/machine-part' },
  { exampleId: 'Polylines1', label: 'Polylines 1', file: 'solid/polyline1' },
  { exampleId: 'Polylines2', label: 'Polylines 2', file: 'solid/polyline2' },
  { exampleId: 'Smiley', label: 'Smiley', file: 'solid/smiley' },
  { exampleId: 'Felge', label: 'Felge', file: 'solid/felge' },

  // history example
  { exampleId: 'CreatePart', label: 'Simple Part Creator', file: 'history/CreatePart' },
  { exampleId: 'CreateAsm', label: 'LBracket Creator', file: 'history/CreateAsm' },
  {
    exampleId: 'Nut-Bolt_Assembly',
    label: 'Nut-Bolt Assembler',
    file: 'history/Nut-Bolt_Assembly',
  },
  {
    exampleId: 'L-Bracket_Assembly',
    label: 'LBracket Assembler',
    file: 'history/LBracket_Assembly',
  },
  { exampleId: 'As1_Assembly', label: 'As1 Assembler', file: 'history/As1_Assembly' },
  { exampleId: 'Gripper', label: 'Gripper Configurator', file: 'history/Gripper_Example' },
  { exampleId: 'FlangePart', label: 'Flange Creator', file: 'history/FlangePrt' },
  { exampleId: 'Flange', label: 'Flange Configurator', file: 'history/FlangeConfigurator' },
  { exampleId: 'FlangeAsm', label: 'Flange Assembler', file: 'history/FlangeAsm' },
  { exampleId: 'RollerAsm', label: 'FMS Roller Configurator', file: 'history/RollerAssembly' },
  { exampleId: 'Wireway', label: 'Wireway Configurator', file: 'history/WirewayAssembly' },
  { exampleId: 'Shadowbox', label: 'Shadowbox Configurator', file: 'history/Shadowbox' },
  { exampleId: 'Wall', label: 'Wall Configurator', file: 'history/SwissProperty' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const example = require(`./models/${t.file}`)
  exampleMap[t.exampleId] = {
    label: t.label,
    text: import(`!!raw-loader!./models/${t.file}.ts`),
    params: { lastUpdatedParam: -1, values: example.paramsMap.map((p: any) => p.value) },
    ...example,
  }
}

const storeApi = vanillaCreate<State>(set => ({
  activeExample: toc[0].exampleId,
  examples: { ids: Object.keys(exampleMap), objs: exampleMap },
  set,
  setParam: (exampleId: string, paramIndex: number, paramValue: number | boolean | string) => {
    set(state =>
      produce(state, draft => {
        draft.examples.objs[exampleId].params.values[paramIndex] = paramValue
        draft.examples.objs[exampleId].params.lastUpdatedParam = paramIndex
      }),
    )
  },
  setAPI: (exampleId: string, api: ApiHistory | ApiNoHistory | null) => {
    set(state =>
      produce(state, draft => {
        if (!api) {
          delete draft.examples.objs[exampleId].api
        } else {
          draft.examples.objs[exampleId].api = api
        }
      }),
    )
  },
}))

const useStore = create<State>(storeApi)

export { useStore, storeApi }

// *****************************************
// TYPES
// *****************************************
type State = Readonly<{
  activeExample: string
  examples: { ids: string[]; objs: Record<string, Example> }
  loading?: boolean
  set: SetState<State>
  setParam: (exampleId: string, paramIndex: number, paramValue: number | boolean | string) => void
  setAPI: (exampleId: string, api: ApiHistory | ApiNoHistory | null) => void
}>

export type Example = {
  label: string
  create: Create
  update?: Update
  getScene?: (productOrSolidId: number, api: ApiHistory | ApiNoHistory) => any
  getBufferGeom?: (productOrSolidId: number, api: ApiHistory | ApiNoHistory) => any
  text?: Promise<{ default: any }>
  params?: { lastUpdatedParam: number; values: any[] }
  paramsMap: Param[]
  cad: history | solid
  api: ApiHistory | ApiNoHistory | null
}
