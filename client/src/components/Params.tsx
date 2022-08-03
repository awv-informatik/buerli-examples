import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Menu, Slider } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { Param, useStore } from '../store'

export const Params: React.FC = () => {
  const exampleId = useStore(s => s.activeExample)
  const params: Param[] = useStore(s => s.examples.objs[exampleId]?.paramsMap)
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'min-content 200px', gap: '10px', alignItems: 'center' }}>
      {params.map(param => [
        <label key={`1-${param.index}-${param.name}-${exampleId}`} style={{ margin: '5px' }}>
          {param.name}
        </label>,
        <ParamInput key={`2-${param.index}-${param.name}-${exampleId}`} param={param} />,
      ])}
    </div>
  )
}

export default Params

// *****************************************
// INTERNALS
// *****************************************

const prs = Number.parseInt

const ParamInput: React.FC<{ param: Param }> = ({ param }) => {
  const { index, type, value } = param
  const exampleId = useStore(s => s.activeExample)
  const setParam = useStore(s => s.setParam)
  const val = useStore(s => s.examples.objs[exampleId].params.values[index] || value) 
  const api = useStore(s => s.examples.objs[exampleId].api)
  return (
    <>
      {type === 'number' ? (
        <NrInput
          type={'number'}
          defaultValue={val}
          onBlur={e => setParam(exampleId, index, prs(e.target.value)) }
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') {
              setParam(exampleId, index, prs(e.target.value))
            }
          }}
        />
      ) : type === 'boolean' ? (
        <input type={'checkbox'} checked={val} onChange={e => setParam(exampleId, index, e.target.checked)} />
      ) : type === 'enum' ? (
        <EnumParam param={param} />
      ) : type === 'slider' ? (
        <SliderParam param={param} />
      ) : type === 'dropdown' ? (
        <DropdownParam param={param} />
      ) : type === 'button' ? (
        <button
          onClick={e => {
            value(api)
            setParam(exampleId, index, Date.now())
          }}
          style={{ cursor: 'pointer' }}>
          run
        </button>
      ) : null}
    </>
  )
}

const EnumParam: React.FC<{ param: Param }> = ({ param }) => {
  const { index, value, values } = param
  const vals = values || []
  const exampleId = useStore(s => s.activeExample)
  const setParam = useStore(s => s.setParam)
  const val = useStore(s => s.examples.objs[exampleId].params.values[index] || value)
  const marks: any = {}
  for (let i = 0; i < vals.length; i++) {
    marks[i] = `${vals[i]}`
  }
  const min = 0
  const max = vals.length - 1
  return (
    <Slider
      marks={marks}
      defaultValue={val}
      min={min}
      max={max}
      step={1}
      onAfterChange={(e: any) => setParam(exampleId, index, vals[e])}
    />
  )
}

const SliderParam: React.FC<{ param: Param }> = ({ param }) => {
  const { index, value, values } = param
  const vals = values || []
  const exampleId = useStore(s => s.activeExample)
  const setParam = useStore(s => s.setParam)
  const val = useStore(s => s.examples.objs[exampleId].params.values[index] || value)
  const min = vals[0]
  const max = vals[vals.length - 1]
  const marks = {
    [min]: min.toString(),
    [max]: max.toString(),
  }
  const step = max / 100 < 1 ? 1 : Math.round(max / 100)
  return (
    <Slider
      marks={marks}
      defaultValue={val}
      min={min}
      max={max}
      step={step}
      onAfterChange={(e: any) => setParam(exampleId, index, e)}
    />
  )
}

const DropdownParam: React.FC<{ param: Param }> = ({ param }) => {
  const { index, value, values } = param
  const vals = values || []
  const exampleId = useStore(s => s.activeExample)
  const setParam = useStore(s => s.setParam)
  const val = useStore(s => s.examples.objs[exampleId].params.values[index] || value)
  return (
    <Dropdown
      overlay={
        <Menu style={{ maxHeight: '255px', overflow: 'auto' }}>
          {vals.map((c, i) => {
            return (
              <Menu.Item
                key={i}
                title={c}
                onClick={() => {
                  setParam(exampleId, index, c)
                }}
                style={{
                  fontFamily: 'courier new',
                  whiteSpace: 'nowrap',
                  fontSize: '12px',
                  lineHeight: '15px',
                  paddingTop: '2px',
                  paddingBottom: '2px',
                  textDecoration: 'none',
                }}>
                {c}
              </Menu.Item>
            )
          })}
        </Menu>
      }
      trigger={['click']}>
      <a>
        {val} <DownOutlined />
      </a>
    </Dropdown>
  )
}

const NrInput = styled.input`
  outline: none;
  border-color: transparent;
  border-radius: 3px;
  padding-left: 6px;
  :focus {
    outline: solid 1px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
  ::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  ::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`
