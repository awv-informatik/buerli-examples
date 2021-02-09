const toc: { label: string; file: string }[] = [
  { label: 'As1_Assembly', file: 'As1_Assembly' },
  { label: 'CreateAsm_Example', file: 'CreateAsm_Example' },
  { label: 'CreatePart_Example', file: 'CreatePart_Example' },
  { label: 'FlangeWithExpressions_Example', file: 'FlangeWithExpressions_Example' },
  { label: 'LBracket_Assembly', file: 'LBracket_Assembly' },
  { label: 'LoadFile_Example', file: 'LoadFile_Example' },
  { label: 'Nut-Bolt_Assembly', file: 'Nut-Bolt_Assembly' },
  { label: 'ShadowboxWithExpressions_Example', file: 'ShadowboxWithExpressions_Example' },
  { label: 'Test_As1_Assembly', file: 'Test_As1_Assembly' },
  { label: 'Test_ConstraintProblem', file: 'Test_ConstraintProblem' },
  { label: 'Test_Cube_Part', file: 'Test_Cube_Part' },
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
