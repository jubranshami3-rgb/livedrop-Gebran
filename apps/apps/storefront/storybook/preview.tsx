import React from 'react'
import type { Preview } from '@storybook/react'
import '../src/index.css'

// Mock providers for stories
const MockCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

const MockAssistantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <div>{children}</div>
}

const preview: Preview = {
  parameters: {
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <MockCartProvider>
        <MockAssistantProvider>
          <div className="p-4">
            <Story />
          </div>
        </MockAssistantProvider>
      </MockCartProvider>
    ),
  ],
}

export default preview