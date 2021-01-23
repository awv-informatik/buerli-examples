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
  { label: 'samples', file: 'samples' },
  { label: 'spline-shape', file: 'spline-shape' },
  { label: 'testfile', file: 'testfile' },
  { label: 'whiffleball', file: 'whiffleball' },
]

export default toc

export const load = () => {
  return toc.map(t => {
    return {
      ...t,
      create: require(`./${t.file}`).create,
      text: require(`!!raw-loader!./${t.file}.ts`).default,
    }
  })
}
