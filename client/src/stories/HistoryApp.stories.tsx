import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import HistoryApp from '../history/HistoryApp'

export default {
  title: 'Examples/History',
  component: HistoryApp,
} as ComponentMeta<typeof HistoryApp>

const Template: ComponentStory<typeof HistoryApp> = args => <HistoryApp {...args} />

export const CreatePart = Template.bind({})
CreatePart.args = {
  label: 'CreatePart',
  filename: 'CreatePart_Example',
}
