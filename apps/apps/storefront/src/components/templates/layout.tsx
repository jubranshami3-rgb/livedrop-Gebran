import React from 'react'
import { Header } from '../organisms/header'
import { SupportPanel } from '../organisms/support-panel'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Skip navigation link for screen readers */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
      >
        Skip to main content
      </a>
      
      <Header />
      <main id="main-content" tabIndex={-1}>
        {children}
      </main>
      <SupportPanel />
    </div>
  )
}

export default Layout