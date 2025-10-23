import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input } from './input'

const meta: Meta<typeof Input> = {
  title: 'Design System/Atoms/Input',
  component: Input,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A flexible input field with support for labels, helper text, and error states.'
      }
    }
  },
  argTypes: {
    type: {
      control: { type: 'select' },
      options: ['text', 'email', 'password', 'number', 'tel'],
      description: 'HTML input type'
    },
    placeholder: {
      control: 'text',
      description: 'Placeholder text'
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the input'
    },
    label: {
      control: 'text',
      description: 'Label text'
    },
    helperText: {
      control: 'text',
      description: 'Helper text displayed below input'
    },
    error: {
      control: 'text',
      description: 'Error message'
    }
  },
  args: {
    placeholder: 'Enter text...',
    type: 'text'
  }
}

export default meta
type Story = StoryObj<typeof Input>

export const Default: Story = {
  args: {
    placeholder: 'Enter your text...'
  }
}

export const WithLabel: Story = {
  args: {
    label: 'Email address',
    placeholder: 'you@example.com',
    type: 'email'
  }
}

export const WithHelperText: Story = {
  args: {
    label: 'Password',
    type: 'password',
    placeholder: 'Enter your password',
    helperText: 'Must be at least 8 characters long'
  }
}

export const WithError: Story = {
  args: {
    label: 'Email address',
    type: 'email',
    placeholder: 'you@example.com',
    error: 'Please enter a valid email address'
  }
}

export const Disabled: Story = {
  args: {
    label: 'Disabled input',
    placeholder: 'This input is disabled',
    disabled: true
  }
}

export const AllStates: Story = {
  render: () => (
    <div className="space-y-4 max-w-md">
      <Input placeholder="Default input" />
      <Input label="With label" placeholder="Enter text" />
      <Input 
        label="With helper text" 
        placeholder="Enter text" 
        helperText="This is helpful information" 
      />
      <Input 
        label="With error" 
        placeholder="Enter text" 
        error="This field is required" 
      />
      <Input 
        label="Disabled" 
        placeholder="Cannot edit this" 
        disabled 
      />
    </div>
  )
}