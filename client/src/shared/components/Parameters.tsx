import { Form, Input } from 'antd'
import React from 'react'
import styled from 'styled-components'
import { useStore } from '../../history/store'

export const Parameters: React.FC<{}> = () => {
  const set = useStore(s => s.set)
  const examples = useStore(s => s.examples)
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])

  const setParams = (newParam: { label: string; value: number }) => {
    const examplesCopy = { ...examples }
    examplesCopy.objs[activeExample].params[newParam.label] = newParam.value
    set({ examples: examplesCopy })
  }

  return example && example.params ? (
    <Container>
      <Form layout="horizontal">
        {Object.keys(example.params).map((key, index) => (
          <Form.Item style={{ margin: '5px' }} key={index} label={key}>
            <Input
              type={'number'}
              value={example.params[key]}
              onChange={(e: any) => {
                setParams({ label: key, value: Number.parseInt(e.target.value) })
              }}
            />
          </Form.Item>
        ))}
      </Form>
    </Container>
  ) : null
}

const Container = styled.div`
  div {
    font-size: 15px;
    padding: 0 0 5px 0;
  }
`
