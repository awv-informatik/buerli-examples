import React from 'react'
import Collapse from 'antd/lib/collapse/Collapse';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import { Example } from '../store'
import Params from './Params'
import Tabs from 'antd/lib/tabs';
import TabPane from 'rc-tabs/lib/TabPanelList/TabPane';
import { solid, history } from '@buerli.io/headless'

export const Sidebar: React.FC<{
  examples: Record<string, Example>
  active?: string | undefined
  onChange: (value: string) => void
}> = ({examples, active, onChange}) => {
  const solidExampleKeys = Object.keys(examples).filter(key => examples[key].cad instanceof solid)
  const historyExampleKeys = Object.keys(examples).filter(key => examples[key].cad instanceof history)
  return (
    <div>
      <Tabs defaultActiveKey="1" onChange={e => console.log(e)}>
        <TabPane tab="Solid" key="1">
          <Options examples={examples} exampleKeys={solidExampleKeys} active={active} onChange={onChange} />
        </TabPane>
        <TabPane tab="History" key="2">
          <Options examples={examples} exampleKeys={historyExampleKeys} active={active} onChange={onChange} />
        </TabPane>
      </Tabs>
    </div>
  )
}

// TODO: How to color active header, how to avoid collapse if no params exist?
const Options: React.FC<{
  examples: Record<string, Example>
  exampleKeys: string[]
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, exampleKeys, active, onChange }) => {
  return (
    <Collapse accordion activeKey={active} ghost onChange={e => {
        e && onChange && onChange(e as string)
      }}>
      {exampleKeys.map(
        key => (
          <CollapsePanel header={examples[key].label} key={key} showArrow={false}>
            {examples[key].paramsMap.length > 0 && <Params />}
          </CollapsePanel>
        )
      )}  
    </Collapse>
  )
}
