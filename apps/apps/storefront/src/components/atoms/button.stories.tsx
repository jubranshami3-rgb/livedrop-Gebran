import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'

const meta: Meta<typeof Button> = {
  title: 'Design System/Atoms/Button',
  component: Button,
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'A versatile button component with multiple variants and sizes. Used for actions throughout the application.'
      }
    }
  },
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline'],
      description: 'Visual style variant',
      table: {
        defaultValue: { summary: 'primary' }
      }
    },
    size: {
      control: { type: 'select' },
      options: ['sm', 'md', 'lg'],
      description: 'Size of the button',
      table: {
        defaultValue: { summary: 'md' }
      }
    },
    disabled: {
      control: 'boolean',
      description: 'Disable the button',
      table: {
        defaultValue: { summary: 'false' }
      }
    },
    onClick: {
      action: 'clicked',
      description: 'Click handler function'
    }
  },
  args: {
    children: 'Button',
    variant: 'primary',
    size: 'md',
    disabled: false
  }
}

export default meta
type Story = StoryObj<typeof Button>

export const Primary: Story = {
  args: {
    variant: 'primary'
  }
}

export const Secondary: Story = {
  args: {
    variant: 'secondary'
  }
}

export const Outline: Story = {
  args: {
    variant: 'outline'
  }
}

export const Small: Story = {
  args: {
    size: 'sm'
  }
}

export const Large: Story = {
  args: {
    size: 'lg'
  }
}

export const Disabled: Story = {
  args: {
    disabled: true
  }
}

export const WithIcon: Story = {
  args: {
    children: (
      <>
        <span>🎁</span>
        <span className="ml-2">Add to Cart</span>
      </>
    )
  }
}

export const AllVariants: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="space-x-2">
        <Button variant="primary" size="sm">Small Primary</Button>
        <Button variant="primary" size="md">Medium Primary</Button>
        <Button variant="primary" size="lg">Large Primary</Button>
      </div>
      <div className="space-x-2">
        <Button variant="secondary" size="sm">Small Secondary</Button>
        <Button variant="secondary" size="md">Medium Secondary</Button>
        <Button variant="secondary" size="lg">Large Secondary</Button>
      </div>
      <div className="space-x-2">
        <Button variant="outline" size="sm">Small Outline</Button>
        <Button variant="outline" size="md">Medium Outline</Button>
        <Button variant="outline" size="lg">Large Outline</Button>
      </div>
    </div>
  )
}