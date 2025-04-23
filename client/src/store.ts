import { ObjectID } from '@buerli.io/core'
import produce from 'immer'
import create, { StoreApi } from 'zustand'
import vanillaCreate from 'zustand/vanilla'
import { CadModel } from './CadModel'

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
  model: CadModel,
  params?: { lastUpdatedParam: number; values: any[] },
  options?: any,
) => Promise<ObjectID | ObjectID[]>

export type Update = (
  model: CadModel,
  productId: ObjectID | ObjectID[],
  params?: { lastUpdatedParam: number; values: any[] },
) => Promise<ObjectID | ObjectID[]>

export type GetScene = (model: CadModel, productOrSolidId: ObjectID | ObjectID[]) => Promise<THREE.Scene>

export type GetBufferGeom = (model: CadModel, productOrSolidId: ObjectID | ObjectID[]) => Promise<THREE.Mesh[]>

const toc: { exampleId: string; label: string; file: string; solid?: boolean }[] = [
  // solid example
  { exampleId: 'Fish', label: 'Fish', file: 'solid/fish', solid: true },
  { exampleId: 'Heart', label: 'Heart', file: 'solid/heart', solid: true },
  { exampleId: 'Lego', label: 'Lego Configurator', file: 'solid/lego', solid: true },
  { exampleId: 'StepImport 1', label: 'Step Import 1', file: 'solid/import-step', solid: true },
  { exampleId: 'StepImport 2', label: 'Step Import 2', file: 'solid/import-step-2', solid: true },
  { exampleId: 'Whiffleball', label: 'Whiffleball', file: 'solid/whiffleball', solid: true },
  { exampleId: 'Profile', label: 'Profile', file: 'solid/Profile', solid: true },
  { exampleId: 'Hackathon', label: 'Hackathon', file: 'solid/hackathon', solid: true },
  { exampleId: 'Mechanical', label: 'Mechanical', file: 'solid/machine-part', solid: true },
  { exampleId: 'Polylines1', label: 'Polylines 1', file: 'solid/polyline1', solid: true },
  { exampleId: 'Polylines2', label: 'Polylines 2', file: 'solid/polyline2', solid: true },
  { exampleId: 'Smiley', label: 'Smiley', file: 'solid/smiley', solid: true },
  { exampleId: 'WheelRim', label: 'Wheel Rim', file: 'solid/wheelRim', solid: true },

  // history example
  { exampleId: 'CreatePart', label: 'Simple Part Creator', file: 'history/CreatePart' },
  { exampleId: 'Sketch', label: 'Simple Sketch', file: 'history/Sketch' },
  { exampleId: 'Sketch 2', label: 'Simple Sketch 2', file: 'history/Sketch2' },
  { exampleId: 'Twist', label: 'Twist Feature', file: 'history/Twist' },
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
  { exampleId: 'RobotArm', label: 'Robot Configurator', file: 'history/Robot6Axis_FC' },
  { exampleId: 'MechanicalAssembly', label: 'Mechanical Simulation', file: 'history/MechanicalAssembly' },
  { exampleId: 'MechanicalAssembly2', label: 'Mechanical Simulation 2', file: 'history/MechanicalAssembly2' },
  { exampleId: 'MechanicalAssembly3', label: 'Mechanical Simulation 3', file: 'history/MechanicalAssembly3' },
  { exampleId: 'GantryRobot', label: 'Gantry Robot', file: 'history/GantryRobot' },
  { exampleId: 'CaseAssembly', label: 'Case Configurator', file: 'history/CaseAssembly' },
]

const storeApi = vanillaCreate<State>(set => ({
  activeExample: '',
  examples: { ids: [], objs: {} },
  set,
  setParam: (exampleId: string, paramIndex: number, paramValue: number | boolean | string) => {
    set(state =>
      produce(state, draft => {
        draft.examples.objs[exampleId].params!.values[paramIndex] = paramValue
        draft.examples.objs[exampleId].params!.lastUpdatedParam = paramIndex
      }),
    )
  },
  setModel: (exampleId: string, model: CadModel | null) => {
    set(state =>
      produce(state, draft => {
        if (!model) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          delete draft.examples.objs[exampleId].model
        } else {
          draft.examples.objs[exampleId].model = model
        }
      }),
    )
  },
}))

const useStore = create(storeApi)

export { storeApi, useStore }

const initExamples = async () => {
  const examples: Record<string, Example> = {}
  for (const t of toc) {
    // console.info(t.exampleId)
    const example = await import(`./models/${t.file}`)
    examples[t.exampleId] = {
      solid: t.solid,
      label: t.label,
      fileUrl: `/models/${t.file}.ts`,
      params: { lastUpdatedParam: -1, values: example.paramsMap.map((p: any) => p.value) },
      ...example,
    }
  }
  storeApi.getState().set(state => ({
    ...state,
    examples: { ids: Object.keys(examples), objs: examples },
    activeExample: toc[0].exampleId,
  }))
}
initExamples()

// *****************************************
// TYPES
// *****************************************
type State = Readonly<{
  activeExample: string
  examples: { ids: string[]; objs: Record<string, Example> }
  busy?: boolean
  set: StoreApi<State>['setState']
  setParam: (exampleId: string, paramIndex: number, paramValue: number | boolean | string) => void
  setModel: (exampleId: string, model: CadModel | null) => void
}>

export type Example = {
  label: string
  create: Create
  update?: Update
  getScene?: GetScene
  getBufferGeom?: GetBufferGeom
  fileUrl?: string
  params?: { lastUpdatedParam: number; values: any[] }
  paramsMap: Param[]
  model: CadModel
  solid?: boolean
}
