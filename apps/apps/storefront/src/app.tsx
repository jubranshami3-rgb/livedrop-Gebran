import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { CartProvider } from './lib/store'
import { AssistantProvider } from './assistant/context'
import Layout from './components/templates/layout'
import Catalog from './pages/catalog'
import Product from './pages/product'
import Cart from './pages/cart'
import Checkout from './pages/checkout'
import OrderStatus from './pages/order-status'

function App() {
  return (
    <CartProvider>
      <AssistantProvider>
        <Router>
          <Layout>
            <Routes>
              <Route path="/" element={<Catalog />} />
              <Route path="/p/:id" element={<Product />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/order/:id" element={<OrderStatus />} />
            </Routes>
          </Layout>
        </Router>
      </AssistantProvider>
    </CartProvider>
  )
}

export default App