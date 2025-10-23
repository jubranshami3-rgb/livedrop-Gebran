import React from 'react'
import { Link } from 'react-router-dom'
import { ShoppingCart, HelpCircle } from 'lucide-react'
import { useCartStore } from '../../lib/store'
import { useAssistant } from '../../assistant/context'
import { Button } from '../atoms/button'

export const Header: React.FC = () => {
  const totalItems = useCartStore(state => state.getTotalItems())
  const { openAssistant } = useAssistant()

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
        
           <Link to="/" className="flex items-center space-x-2">
             <img 
                src="/logo.svg" 
                alt="Storefront Logo" 
                className="w-8 h-8"
                width="32"
                height="32"
                              />
               <span className="text-xl font-bold text-gray-900">Storefront</span>
                </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors">
              Catalog
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="sm"
              onClick={openAssistant}
              className="flex items-center space-x-2"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Support</span>
            </Button>

            <Link
              to="/cart"
              className="relative p-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}