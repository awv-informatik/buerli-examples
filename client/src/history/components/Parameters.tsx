import { Form, Input } from 'antd'
import React, { useState } from 'react'
import styled from 'styled-components'
import { Example, useStore } from '../store'

export const Parameters: React.FC<{}> = () => {
  const set = useStore(s => s.set)
  const examples = useStore(s => s.examples)
  const activeExample = useStore(s => s.activeExample)
  const example = useStore(s => s.examples.objs[activeExample])
  const [localExamples, setLocalExamples] = useState<{ ids: string[]; objs: Record<string, Example> }>(examples)

  const handleOnChange = (newParam: { label: string; value: number }) => {
    const examplesCopy = { ...localExamples }
    examplesCopy.objs[activeExample].params[newParam.label] = newParam.value
    setLocalExamples(examplesCopy)
  }

  return example && example.params ? (
    <Container>
      <Form layout="horizontal">
        {Object.keys(example.params).map((key, index) => (
          <Form.Item style={{ margin: '5px' }} key={index} label={key}>
            <Input
              type={'number'}
              value={example.params[key]}
              onBlur={(e: any) => {
                set({ examples: localExamples })
              }}
              onKeyDown={(e: any) => {
                if (e.key === 'Enter') {
                  set({ examples: localExamples })
                }
              }}
              onChange={(e: any) => {
                handleOnChange({ label: key, value: Number.parseInt(e.target.value) })
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
