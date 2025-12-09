import Collapse from 'antd/lib/collapse/Collapse'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import Tabs from 'antd/lib/tabs'
import TabPane from 'rc-tabs/lib/TabPanelList/TabPane'
import React from 'react'
import { Example, useStore } from '../store'
import './../styles/custom.css'
import Params from './Params'

export const Sidebar: React.FC<{
  examples: Record<string, Example>
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, active, onChange }) => {
  const arr = Object.keys(examples).map(e => examples[e])
  const groups: Record<string, Example[]> = {}
  for (const entry of arr) {
    groups[entry.type] = groups[entry.type] ? [...groups[entry.type], entry] : [entry]
  }
  const groupNames = Object.keys(groups)
  return (
    <Tabs defaultActiveKey="0">
      {groupNames.map((name, index) => (
        <TabPane tab={name} key={`${index}`}>
          <Options examples={groups[name]} active={active} onChange={onChange} />
        </TabPane>
      ))}
    </Tabs>
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
      onChange={e => {
        e && onChange && onChange(e as string)
      }}>
      {examples.map(example => (
        <CollapsePanel
          header={<div style={active === example.exampleId ? activeStyle : {}}>{example.label}</div>}
          key={example.exampleId}
          showArrow={false}
          collapsible={busy ? 'disabled' : 'header'}>
          <div style={{ paddingLeft: '20px' }}>{example.paramsMap.length > 0 && <Params />}</div>
        </CollapsePanel>
      ))}
    </Collapse>
  )
}

const activeStyle = { color: 'dodgerblue', fontWeight: 'bold' }
