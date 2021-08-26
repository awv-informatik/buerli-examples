import { ApiNoHistory } from '@buerli.io/headless'
import create, { SetState } from 'zustand'

const toc: { label: string; file: string }[] = [
  { label: 'smiley', file: 'smiley' },
  { label: 'atomium', file: 'atomium' },
  { label: 'felge', file: 'felge' },
  { label: 'fish', file: 'fish' },
  { label: 'hackathon', file: 'hackathon' },
  { label: 'heart', file: 'heart' },
  { label: 'lego', file: 'lego' },
  { label: 'machine-part', file: 'machine-part' },
  { label: 'polyline-extrusion', file: 'polyline-extrusion' },
  { label: 'polyline-revolve', file: 'polyline-revolve' },
  { label: 'rounded-rect', file: 'rounded-rect' },
  { label: 'spline-shape', file: 'spline-shape' },
  { label: 'whiffleball', file: 'whiffleball' },
]

const exampleMap: Record<string, Example> = {}
for (const t of toc) {
  exampleMap[t.label] = {
    label: t.label,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
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
  create?: (api: ApiNoHistory) => any
  text?: Promise<{ default: any }>
}
