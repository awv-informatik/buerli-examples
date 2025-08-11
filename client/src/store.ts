import { BuerliCadFacade } from '@buerli.io/classcad'
import { ObjectID } from '@buerli.io/core'
import produce from 'immer'
import create, { StoreApi } from 'zustand'
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
  model: BuerliCadFacade,
  params?: { lastUpdatedParam: number; values: any[] },
  options?: any,
) => Promise<ObjectID | ObjectID[]>

export type Update = (
  model: BuerliCadFacade,
  productId: ObjectID | ObjectID[],
  params?: { lastUpdatedParam: number; values: any[] },
) => Promise<ObjectID | ObjectID[]>

export type GetScene = (model: BuerliCadFacade, productOrSolidId: ObjectID | ObjectID[]) => Promise<THREE.Scene>

export type GetBufferGeom = (model: BuerliCadFacade, productOrSolidId: ObjectID | ObjectID[]) => Promise<THREE.Mesh[]>

type ExampleDef = { exampleId: string; label: string; file: string; type: string }

const toc: ExampleDef[] = [
  // solid example
  { exampleId: 'Fish', label: 'Fish', file: 'solid/fish', type: 'Solid' },
  { exampleId: 'Heart', label: 'Heart', file: 'solid/heart', type: 'Solid' },
  { exampleId: 'Lego', label: 'Lego Configurator', file: 'solid/lego', type: 'Solid' },
  { exampleId: 'StepImport 1', label: 'Step Import 1', file: 'solid/import-step', type: 'Solid' },
  { exampleId: 'StepImport 2', label: 'Step Import 2', file: 'solid/import-step-2', type: 'Solid' },
  { exampleId: 'Whiffleball', label: 'Whiffleball', file: 'solid/whiffleball', type: 'Solid' },
  { exampleId: 'Profile', label: 'Profile', file: 'solid/Profile', type: 'Solid' },
  { exampleId: 'Hackathon', label: 'Hackathon', file: 'solid/hackathon', type: 'Solid' },
  { exampleId: 'Mechanical', label: 'Mechanical', file: 'solid/machine-part', type: 'Solid' },
  { exampleId: 'Polylines1', label: 'Polylines 1', file: 'solid/polyline1', type: 'Solid' },
  { exampleId: 'Polylines2', label: 'Polylines 2', file: 'solid/polyline2', type: 'Solid' },
  { exampleId: 'Smiley', label: 'Smiley', file: 'solid/smiley', type: 'Solid' },
  { exampleId: 'WheelRim', label: 'Wheel Rim', file: 'solid/wheelRim', type: 'Solid' },

  // part example
  { exampleId: 'CreatePart', label: 'Simple Part Creator', file: 'history/CreatePart', type: 'Part' },
  { exampleId: 'Sketch', label: 'Simple Sketch', file: 'history/Sketch', type: 'Part' },
  { exampleId: 'Sketch 2', label: 'Simple Sketch 2', file: 'history/Sketch2', type: 'Part' },
  { exampleId: 'Twist', label: 'Twist Feature', file: 'history/Twist', type: 'Part' },
  { exampleId: 'Gripper', label: 'Gripper Configurator', file: 'history/Gripper_Example', type: 'Part' },
  { exampleId: 'FlangePart', label: 'Flange Creator', file: 'history/FlangePrt', type: 'Part' },
  { exampleId: 'Flange', label: 'Flange Configurator', file: 'history/FlangeConfigurator', type: 'Part' },
  { exampleId: 'Shadowbox', label: 'Shadowbox Configurator', file: 'history/Shadowbox', type: 'Part' },
  // assembly example
  { exampleId: 'CreateAsm', label: 'LBracket Creator', file: 'history/CreateAsm', type: 'Assembly' },
  { exampleId: 'Nut-Bolt_Assembly', label: 'Nut-Bolt Assembler', file: 'history/Nut-Bolt_Assembly', type: 'Assembly' }, // prettier-ignore
  { exampleId: 'L-Bracket_Assembly', label: 'LBracket Assembler', file: 'history/LBracket_Assembly', type: 'Assembly' }, // prettier-ignore
  { exampleId: 'As1_Assembly', label: 'As1 Assembler', file: 'history/As1_Assembly', type: 'Assembly' },
  { exampleId: 'FlangeAsm', label: 'Flange Assembler', file: 'history/FlangeAsm', type: 'Assembly' },
  { exampleId: 'RollerAsm', label: 'FMS Roller Configurator', file: 'history/RollerAssembly', type: 'Assembly' },
  { exampleId: 'Wireway', label: 'Wireway Configurator', file: 'history/WirewayAssembly', type: 'Assembly' },
  { exampleId: 'Wall', label: 'Wall Configurator', file: 'history/SwissProperty', type: 'Assembly' },
  { exampleId: 'RobotArm', label: 'Robot Configurator', file: 'history/Robot6Axis_FC', type: 'Assembly' },
  { exampleId: 'MechanicalAssembly', label: 'Mechanical Simulation', file: 'history/MechanicalAssembly', type: 'Assembly' }, // prettier-ignore
  { exampleId: 'MechanicalAssembly2', label: 'Mechanical Simulation 2', file: 'history/MechanicalAssembly2', type: 'Assembly' }, // prettier-ignore
  { exampleId: 'MechanicalAssembly3', label: 'Mechanical Simulation 3', file: 'history/MechanicalAssembly3', type: 'Assembly' }, // prettier-ignore
  { exampleId: 'GantryRobot', label: 'Gantry Robot', file: 'history/GantryRobot', type: 'Assembly' },
  { exampleId: 'CaseAssembly', label: 'Case Configurator', file: 'history/CaseAssembly', type: 'Assembly' },
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
  setModel: (exampleId: string, model: BuerliCadFacade | null) => {
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

const useStore = create<State>(storeApi as any) // TODO: Remove 'as any' once types are fine again with zustand

export { storeApi, useStore }

const initExamples = async () => {
  const examples: Record<string, Example> = {}
  for (const t of toc) {
    // console.info(t.exampleId)
    let example = await import(`./models/${t.file}`)
    if (example.default) {
      example = { ...example, ...example.default }
    }
    examples[t.exampleId] = {
      fileUrl: `/models/${t.file}.ts`,
      params: { lastUpdatedParam: -1, values: example.paramsMap.map((p: any) => p.value) },
      ...t,
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
  setModel: (exampleId: string, model: BuerliCadFacade | null) => void
}>

export type Example = ExampleDef & {
  create: Create
  update?: Update
  getScene?: GetScene
  getBufferGeom?: GetBufferGeom
  fileUrl?: string
  params?: { lastUpdatedParam: number; values: any[] }
  paramsMap: Param[]
  model: BuerliCadFacade
}
