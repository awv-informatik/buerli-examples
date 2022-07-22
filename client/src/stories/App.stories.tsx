import React from 'react'
import { ComponentMeta, ComponentStory } from '@storybook/react'
import App from '../App'

export default {
  title: 'Example/App',
  component: App,
} as ComponentMeta<typeof App>

const Template: ComponentStory<typeof App> = args => <App {...args} />

export const Primary = Template.bind({})
