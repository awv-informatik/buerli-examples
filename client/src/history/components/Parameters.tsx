import { Form, Input } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useStore } from '../store'

export const Parameters: React.FC = () => {
  const active = useStore(s => s.activeExample)
  const params = useStore(s => s.examples.objs[active]?.params)
  return params ? (
    <Container>
      <Form layout="horizontal">
        {Object.keys(params).map((key, index) => (
          <Form.Item style={{ margin: '5px' }} key={index} label={key}>
            <Param exampleId={active} name={key} value={params[key]} />
          </Form.Item>
        ))}
      </Form>
    </Container>
  ) : null
}

const Param: React.FC<{ exampleId: string; value: number; name: string }> = ({ exampleId, value, name }) => {
  const setParam = useStore(s => s.setParam)
  const [val, setVal] = React.useState<number>(value)
  console.info(val)

  const handleOnChange = React.useCallback(() => {
    setParam(exampleId, name, val)
  }, [val, name, exampleId, setParam])

  return (
    <Input
      type={'number'}
      value={val || ''}
      onBlur={handleOnChange}
      onKeyDown={(e: any) => {
        if (e.key === 'Enter') {
          handleOnChange()
        }
      }}
      onChange={(e: any) => {
        setVal(Number.parseInt(e.target.value))
      }}
    />
  )
}

const Container = styled.div`
  div {
    font-size: 15px;
    padding: 0 0 5px 0;
  }
`
