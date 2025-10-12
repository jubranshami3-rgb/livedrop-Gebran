// In the cart item quantity controls section:
<div className="flex items-center space-x-2">
  <Button
    variant="outline"
    size="sm"
    onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
    disabled={item.quantity <= 1}
    aria-label={`Decrease quantity of ${item.product.title}`}
  >
    <Minus className="w-4 h-4" />
  </Button>
  
  <span 
    className="w-12 text-center font-medium"
    aria-live="polite"
    aria-label={`Current quantity: ${item.quantity}`}
  >
    {item.quantity}
  </span>
  
  <Button
    variant="outline"
    size="sm"
    onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
    disabled={item.quantity >= item.product.stockQty}
    aria-label={`Increase quantity of ${item.product.title}`}
  >
    <Plus className="w-4 h-4" />
  </Button>
</div>

// Remove button with proper ARIA label:
<Button
  variant="outline"
  size="sm"
  onClick={() => removeItem(item.product.id)}
  aria-label={`Remove ${item.product.title} from cart`}
>
  <Trash2 className="w-4 h-4" />
</Button>