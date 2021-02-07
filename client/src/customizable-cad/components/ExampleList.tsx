import React from 'react'
import { Options } from '../../shared/components'
import { useStore } from '../store'

export const ExampleList: React.FC = () => {
  const set = useStore(s => s.set)
  const ids = useStore(s => s.examples.ids)
  const active = useStore(s => s.activeExample)
  return <Options values={ids} onChange={v => set({ activeExample: v })} active={active} />
}
