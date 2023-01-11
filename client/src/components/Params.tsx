import { DownOutlined } from '@ant-design/icons'
import { Dropdown, Menu, Slider } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { Param, ParamType, storeApi, useStore } from '../store'

export const Params: React.FC = () => {
  const exampleId = useStore(s => s.activeExample)
  const params: Param[] = useStore(s => s.examples.objs[exampleId]?.paramsMap)
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'min-content 150px',
        gap: '10px',
        alignItems: 'center',
      }}>
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

const setParamIfValChanged = (
  newVal: number | boolean | string,
  oldVal: number | boolean | string,
  index: number,
) => {
  const exampleId = storeApi.getState().activeExample
  const setParam = storeApi.getState().setParam
  if (newVal !== oldVal) {
    setParam(exampleId, index, newVal)
  }
}

const ParamInput: React.FC<{ param: Param }> = ({ param }) => {
  const { index, type, value } = param
  const exampleId = useStore(s => s.activeExample)
  const setParam = useStore(s => s.setParam)
  const val = useStore(s => s.examples.objs[exampleId].params.values[index])
  const api = useStore(s => s.examples.objs[exampleId].api)
  return (
    <>
      {type === ParamType.Number ? (
        <NrInput
          type={'number'}
          defaultValue={val}
          onBlur={(e: any) => {
            setParamIfValChanged(prs(e.target.value), val, index)
          }}
          onKeyDown={(e: any) => {
            if (e.key === 'Enter') {
              setParamIfValChanged(prs(e.target.value), val, index)
            }
          }}
        />
      ) : type === ParamType.Checkbox ? (
        <input
          type={'checkbox'}
          checked={val}
          onChange={(e: any) => {
            setParamIfValChanged(e.target.checked, val, index)
          }}
        />
      ) : type === ParamType.Enum ? (
        <EnumParam param={param} />
      ) : type === ParamType.Slider ? (
        <SliderParam param={param} />
      ) : type === ParamType.Dropdown ? (
        <DropdownParam param={param} />
      ) : type === ParamType.Button ? (
        <button
          onClick={e => {
            value(api, val)
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
      onAfterChange={(e: any) => {
        setParamIfValChanged(vals[e], val, index)
      }}
    />
  )
}

const SliderParam: React.FC<{ param: Param }> = ({ param }) => {
  const { index, value, step, values } = param
  const vals = values || []
  const exampleId = useStore(s => s.activeExample)
  const val = useStore(s => s.examples.objs[exampleId].params.values[index] || value)
  const min = vals[0]
  const max = vals[vals.length - 1]
  const marks = {
    [min]: min.toString(),
    [max]: max.toString(),
  }

  const defaultStep = (max - min) / 100
  return (
    <Slider
      marks={marks}
      defaultValue={val}
      min={min}
      max={max}
      step={step ? step : defaultStep}
      onAfterChange={(e: any) => {
        setParamIfValChanged(e, val, index)
      }}
    />
  )
}

const DropdownParam: React.FC<{ param: Param }> = ({ param }) => {
  const { index, value, values } = param
  const vals = values || []
  const exampleId = useStore(s => s.activeExample)
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
                  setParamIfValChanged(c, val, index)
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
