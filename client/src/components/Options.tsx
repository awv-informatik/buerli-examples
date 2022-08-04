import React from 'react'
import Collapse from 'antd/lib/collapse/Collapse';
import CollapsePanel from 'antd/lib/collapse/CollapsePanel';
import { Example } from '../store'
import Params from './Params'

// TODO: How to color active header, how to avoid collapse if no params exist?
export const Options: React.FC<{
  examples: Record<string, Example>
  active?: string | undefined
  onChange: (value: string) => void
}> = ({ examples, active, onChange }) => {
  return (
    <Collapse accordion activeKey={active} ghost onChange={e => {
        e && onChange && onChange(e as string)
      }}>
      {Object.keys(examples).map(
        key => (
          <CollapsePanel header={examples[key].label} key={key} showArrow={false}>
            {examples[key].paramsMap.length > 0 && <Params />}
          </CollapsePanel>
        )
      )}  
    </Collapse>
  )
}

export default Options
