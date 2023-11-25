import React from 'react'
import Collapse from 'antd/lib/collapse/Collapse'
import CollapsePanel from 'antd/lib/collapse/CollapsePanel'
import { Example, useStore } from '../store'
import Params from './Params'
import Tabs from 'antd/lib/tabs'
import TabPane from 'rc-tabs/lib/TabPanelList/TabPane'
import { solid, history } from '@buerli.io/headless'
import './../styles/custom.css'

export const Sidebar: React.FC<{
  examples: Record<string, Example>
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, active, onChange }) => {
  const solidExampleKeys = Object.keys(examples).filter(key => examples[key].cad instanceof solid)
  const historyExampleKeys = Object.keys(examples).filter(
    key => examples[key].cad instanceof history,
  )
  return (
    <Tabs defaultActiveKey="1">
      <TabPane tab="Solid" key="1">
        <Options
          examples={examples}
          exampleKeys={solidExampleKeys}
          active={active}
          onChange={onChange}
        />
      </TabPane>
      <TabPane tab="History" key="2">
        <Options
          examples={examples}
          exampleKeys={historyExampleKeys}
          active={active}
          onChange={onChange}
        />
      </TabPane>
    </Tabs>
  )
}

// TODO: How to color active header, how to avoid collapse if no params exist?
const Options: React.FC<{
  examples: Record<string, Example>
  exampleKeys: string[]
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, exampleKeys, active, onChange }) => {
  const busy = useStore(s => s.busy)
  return (
    <Collapse
      accordion
      activeKey={active}
      ghost
      onChange={e => {
        e && onChange && onChange(e as string)
      }}>
      {exampleKeys.map(key => (
        <CollapsePanel
          header={<div style={active === key ? activeStyle : {}}>{examples[key].label}</div>}
          key={key}
          showArrow={false}
          collapsible={busy ? 'disabled' : 'header'}>
          <div style={{ paddingLeft: '20px' }}>
            {examples[key].paramsMap.length > 0 && <Params />}
          </div>
        </CollapsePanel>
      ))}
    </Collapse>
  )
}

const activeStyle = { color: 'dodgerblue', fontWeight: 'bold' }
