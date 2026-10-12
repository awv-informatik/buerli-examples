import { Collapse, Tabs } from 'antd'
import React from 'react'
import { Example, useStore } from '../store'
import './../styles/custom.css'
import Params from './Params'

export const Sidebar: React.FC<{
  examples: Record<string, Example>
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, active, onChange }) => {
  const groups: Record<string, Example[]> = {}
  for (const entry of Object.values(examples)) {
    groups[entry.type] = [...(groups[entry.type] || []), entry]
  }
  return (
    <Tabs
      defaultActiveKey="0"
      items={Object.keys(groups).map((name, index) => ({
        key: `${index}`,
        label: name,
        children: <Options examples={groups[name]} active={active} onChange={onChange} />,
      }))}
    />
  )
}

// TODO: How to color active header, how to avoid collapse if no params exist?
const Options: React.FC<{
  examples: Example[]
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, active, onChange }) => {
  const busy = useStore(s => s.busy)
  return (
    <Collapse
      accordion
      activeKey={active}
      ghost
      onChange={keys => {
        // accordion: one panel at most, the one opened last
        const key = Array.isArray(keys) ? keys[0] : keys
        key && onChange && onChange(key)
      }}
      items={examples.map(example => ({
        key: example.exampleId,
        label: <div style={active === example.exampleId ? activeStyle : {}}>{example.label}</div>,
        showArrow: false,
        collapsible: busy ? 'disabled' : 'header',
        children: <div style={{ paddingLeft: '20px' }}>{example.paramsMap.length > 0 && <Params />}</div>,
      }))}
    />
  )
}

const activeStyle = { color: 'dodgerblue', fontWeight: 'bold' }
