Create comprehensive Tailwind CSS configuration for an e-commerce application:

DESIGN TOKENS:
- Color palette: primary blue (#3B82F6), semantic colors for success/warning/error
- Spacing: use default Tailwind scale (0.25rem increments)
- Typography: system font stack with proper hierarchy
- Border radius: consistent rounded corners (8px default)
- Shadows: subtle elevation system

CONFIGURATION:
- tailwind.config.js with extended theme
- postcss.config.js for processing
- src/index.css with base styles and utilities
- No custom CSS classes - pure utility-first approach
- Responsive breakpoints: sm, md, lg, xl
- Focus states for accessibility

SPECIFIC STYLING:
- Button variants: primary, secondary, outline with proper hover/focus states
- Input fields with consistent borders and focus rings
- Card components with subtle shadows
- Grid layouts for product catalogs
- Mobile-first responsive design
Create the main React application entry files:


- React 18 createRoot rendering
- Strict mode enabled
- Import global CSS styles


- React Router DOM setup with BrowserRouter
- Route configuration for all pages:
  * / → Catalog
  * /p/:id → Product details  
  * /cart → Shopping cart
  * /checkout → Checkout stub
  * /order/:id → Order status
- Provider wrappers for Cart and Assistant contexts
- Layout component wrapping all routes
- Suspense boundaries for lazy loading


- Tailwind directives: @tailwind base, components, utilities
- Custom base styles for:
  * Focus outlines
  * Scroll behavior
  * Typography defaults
- No component-specific CSS classes
Create comprehensive mock data and API service layer:

- 20+ realistic e-commerce products with:
  * id: string
  * title: string (descriptive product names)
  * price: number (in cents for precision)
  * image: string (placeholder image URLs)
  * tags: string[] (categories like "electronics", "clothing", "home")
  * stockQty: number (varying quantities for testing)
  * description: string (detailed product descriptions)

- TypeScript interfaces for Product, CartItem, Order
- Mock API functions with simulated delays:
  * listProducts(): Promise<Product[]>
  * getProduct(id: string): Promise<Product | null>
  * getOrderStatus(id: string): Promise<Order | null>
  * placeOrder(cart: CartItem[]): Promise<{ orderId: string }>
- Mock order data with different statuses: placed, packed, shipped, delivered
- Proper error handling patterns

- formatCurrency(amount: number): string - format cents to dollars
- formatDate(dateString: string): string - user-friendly date formatting
Create a shopping cart state management system using Zustand:

- Cart state interface with:
  * items: CartItem[] (product + quantity)
  * addItem, removeItem, updateQuantity actions
  * clearCart, getTotalItems, getTotalPrice utilities
- localStorage persistence for cart items
- TypeScript interfaces for type safety
- React Context provider for component compatibility
- Proper immutability in state updates
- Stock validation when adding/updating items

REQUIRED FUNCTIONALITY:
- Add product to cart (increment if exists)
- Remove product from cart
- Update quantity with min/max validation
- Calculate total items and price
- Clear entire cart
- Persist cart across browser sessions
- Rehydrate from localStorage on init
Create a versatile Button atom component with comprehensive Storybook documentation:

- Props: variant ('primary' | 'secondary' | 'outline'), size ('sm' | 'md' | 'lg'), disabled, all button HTML attributes
- Tailwind utility classes only (no custom CSS)
- Proper TypeScript interface extending ButtonHTMLAttributes
- Accessibility: focus rings, disabled states, ARIA labels support
- Responsive design

- Storybook Meta configuration with controls for all props
- Stories for: Default, All Variants, All Sizes, Disabled, With Icon
- Interactive controls to test all combinations
- Documentation showing usage examples
- Accessibility testing in Storybook
Create an accessible Input atom component with multiple states:

- Props: label?, helperText?, error?, all input HTML attributes
- Proper label association with htmlFor
- Error state styling with red borders
- Helper text support
- ARIA attributes for accessibility
- Tailwind-only styling

- Stories: Default, With Label, With Helper Text, With Error, Disabled, All States
- Interactive controls for all props
- Documentation for form usage patterns
Create a performance-optimized LazyImage component:

- Intersection Observer for lazy loading
- Loading state with opacity transition
- Proper aspect ratio handling
- src, alt, className, width, height props
- Accessibility: alt text required
- Placeholder while loading

- Stories showing loading states
- Different aspect ratio examples
- Performance considerations documentation
Create a ProductCard molecule for displaying products:

- Props: product, onAddToCart?, isLoading?
- Display: image, title, price, stock status, tags
- Add to cart button with loading state
- Accessibility: proper ARIA labels, semantic HTML
- Stock level indicators (In Stock, Low Stock, Out of Stock)
- Responsive grid layout

- Stories: Default, Low Stock, Out of Stock, Long Title, Many Tags, Loading State, Product Grid
- Mock product data for examples
- Interactive add to cart actions
- Mobile and desktop layouts
Create a SearchBox molecule with icon:

- Props: value, onChange, placeholder?
- Controlled component pattern
- Search icon from Lucide React
- Proper input styling with Tailwind
- Accessibility labels

- Interactive value control
- Different placeholder examples
- Integration examples with other components
Create the main Header organism component:

- Logo with link to home
- Navigation menu
- Cart icon with item count badge
- Support panel trigger button
- Responsive design
- Accessibility: skip navigation, proper ARIA labels

- Stories: Default, Empty Cart, Many Items, Mobile View, Tablet View
- Controls for cartItemsCount
- Action handlers for cart and support clicks
- Viewport testing for responsive design
Create an accessible Support Panel organism:

- Slide-over panel design
- Focus trapping for accessibility
- Message history display
- Input form with submit
- Loading states
- ARIA roles: dialog, log, status
- Keyboard navigation (Escape to close, Tab trapping)

- Stories: Open State, With Messages, Loading State
- Interactive message history
- Accessibility testing in Storybook
- Focus management examples
Create the main Layout template component:

- Header integration
- Main content area with proper spacing
- Support panel overlay
- Skip navigation link for accessibility
- Responsive container max-widths
- Props for cart count and support panel state

- Stories: Default, With Product Grid, With Support Panel, Empty Cart
- Different content examples
- Mobile and desktop layouts
- Documentation for page composition
Create the Catalog page component:

- Product grid using ProductCard components
- Search functionality (client-side filtering)
- Sort options (price asc/desc, name)
- Tag filtering
- Loading states
- Empty state when no products match
- Responsive grid layout

- Stories: Default, Empty State, Mobile View
- Mock product data
- Search and filter interactions
- Integration with Layout template
Create the Product details page:

- Product image, title, price, description, stock
- Add to cart functionality
- Related products section (by shared tags)
- Loading and error states
- Breadcrumb navigation
Create the Shopping Cart page:

- Display cart items with images, quantities, prices
- Quantity update controls (+/- buttons)
- Remove item functionality
- Order summary with subtotal
- Empty cart state
- Proceed to checkout button
- Persistent cart via localStorage

No Storybook for pages
Create the Checkout stub page:

- Order summary display
- "Place order" button that creates mock order
- Navigation to order status page
- Clear cart after successful order
- Demo message about real implementation

No Storybook for pages
Create the Order Status page:

- Dynamic route /order/:id
- Order status timeline (placed → packed → shipped → delivered)
- Order details with items and totals
- Shipping information when available
- Loading and not found states
- Visual progress indicator

No Storybook for pages
Create a local Q&A matching engine for customer support:

- 20 realistic e-commerce Q&A pairs
- Categories: Returns, Shipping, Payment, Products, Account, Order, Pricing, Support, Privacy, General
- qid format: Q01 through Q20
- Questions: common customer inquiries
- Answers: concise, helpful responses

- System prompt for the assistant
- Guidelines: only answer from ground truth, cite sources, mask PII, refuse out-of-scope
- Response format requirements

- processQuery function with:
  * Order ID detection using regex [A-Z0-9]{10,}
  * Keyword-based Q&A matching with confidence scoring
  * PII masking (show only last 4 characters of IDs)
  * Order status integration when order ID present
  * Citation display [Qxx]
  * Polite refusal for low-confidence questions

- React Context for support panel state
- Message history management
- Loading states
- Integration with assistant engine

- Unit tests for:
  * Known policy questions return answers with citations
  * Out-of-scope questions get polite refusal
  * Questions with order IDs include status and citation
  * PII masking works correctly

  Create comprehensive Storybook configuration:

DIRECTORY: .storybook/

FILE: main.ts
- Storybook 7 configuration
- Stories path configuration
- Addons: essentials, interactions, links, a11y, viewport
- TypeScript configuration
- Vite integration

FILE: preview.tsx
- Global decorators for providers
- Tailwind CSS import
- Viewport configurations
- Backgrounds for testing
- Mock providers for components

Implement performance optimizations throughout the application:

REQUIREMENTS:
- Cold load ≤ 200 KB JS (gzipped) excluding images
- Lazy-load image assets
- Route transition p95 < 250 ms on dev build

IMPLEMENTATION:
- React.lazy and Suspense for route-based code splitting
- Custom LazyImage component with Intersection Observer
- Dynamic imports for Lucide React icons
- Vite bundle analysis and chunk splitting
- Performance monitoring utilities

- Route transition timing measurements
- Performance monitoring helpers
Implement comprehensive accessibility features:

REQUIREMENTS:
- Keyboard navigation for all interactive elements
- Focus trapping in modals and drawers
- ARIA labels on all form controls
- Screen reader support
- Color contrast compliance

IMPLEMENTATION:
- Support panel: focus trapping, Escape key close, ARIA dialog roles
- Product cards: semantic HTML, proper labels, keyboard handlers
- Forms: associated labels, error announcements, ARIA attributes
- Skip navigation link
- Focus management for dynamic content
- High contrast color ratios
- ARIA live regions for dynamic updates
Create comprehensive test suite:

- Vitest configuration
- Testing Library matchers
- DOM testing setup

- Unit tests for currency and date formatting

- Assistant functionality tests
- Order ID detection
- Q&A matching
- PII masking
- Confidence scoring

TEST COVERAGE:
- Known policy questions return answers with citations
- Out-of-scope questions get refused
- Order ID questions include status
- All utility functions
- Component rendering with different props
Create a modern SVG logo for the Storefront e-commerce application:

- Scalable vector graphic
- E-commerce theme (shopping bag, cart, or abstract S)
- Blue color scheme matching the app (#3B82F6)
- Rounded corners to match UI
- Simple, clean, professional design
- Small file size (< 1KB)
- Proper viewBox and dimensions
- Accessible with potential title/desc

FEATURES:
- Shopping bag icon with handle
- Gradient background for visual interest
- Sparkle/details for brand personality
- Multiple variations for different use cases