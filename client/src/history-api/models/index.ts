const toc: { label: string; file: string }[] = [
  { label: 'Cube_Part', file: 'Cube_Part' },
  { label: 'As1_Assembly', file: 'As1_Assembly' },
  { label: 'ConstraintProblem_Example', file: 'ConstraintProblem_Example' },
  { label: 'CreateAsm_Example', file: 'CreateAsm_Example' },
  { label: 'Cylinder_Part', file: 'Cylinder_Part' },
  { label: 'Flange_Part', file: 'Flange_Part' },
  { label: 'LBracket_Assembly', file: 'LBracket_Assembly' },
  { label: 'Nut-Bolt_Assembly', file: 'Nut-Bolt_Assembly' },
  { label: 'Shadowbox_Part', file: 'Shadowbox_Part' },
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
