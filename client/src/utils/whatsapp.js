export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export function buildWhatsAppUrl(phoneNumber, message) {
  if (!phoneNumber) return null;
  // Strip all non-numeric characters (removes spaces, +, -, ())
  const cleanNumber = phoneNumber.replace(/\D/g, '');
  if (!cleanNumber) return null;
  return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(storeName, product, quantity = 1, currentUrl = '') {
  return `Hello ${storeName},

I would like to order the following product.

Product:
${product.name} (${product.sku})

Price:
${formatCurrency(product.price)}

Quantity:
${quantity}

Subtotal:
${formatCurrency(product.price * quantity)}

Product Link:
${currentUrl || window.location.href}

Customer Name:
_________

Delivery Address:
_________

Please confirm availability.`;
}

export function cartWhatsAppMessage(storeName, items) {
  const lines = items.map((item, index) => `${index + 1}. ${item.name} (${item.quantity} x ${formatCurrency(item.price)}) = ${formatCurrency(item.price * item.quantity)}`);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  return `Hello ${storeName},

I would like to place an order for the following items:

${lines.join('\n')}

Grand Total:
${formatCurrency(total)}

Customer Name:
_________

Delivery Address:
_________

Please confirm availability.`;
}
