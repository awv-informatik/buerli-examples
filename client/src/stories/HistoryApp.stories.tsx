import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import HistoryApp from '../history/HistoryApp'

export default {
  title: 'Example/HistoryApp',
  component: HistoryApp,
} as ComponentMeta<typeof HistoryApp>

const Template: ComponentStory<typeof HistoryApp> = args => <HistoryApp {...args} />

export const Primary = Template.bind({})
