export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function buildWhatsAppUrl(phone, message) {
  if (!phone) return '#';
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone) return '#';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
}

export function productWhatsAppMessage(storeName, product, quantity = 1, currentUrl = '') {
  const name = product?.name || 'Product';
  const sku = product?.sku || 'N/A';
  const price = product?.sale_price || product?.price || 0;
  
  return `Hello ${storeName || 'Store'},

I would like to order the following product.

Product:
${name} (${sku})

Price:
${formatCurrency(price)}

Quantity:
${quantity}

Subtotal:
${formatCurrency(price * quantity)}

Product Link:
${currentUrl || window.location.href}

Customer Name:
_________

Delivery Address:
_________

Please confirm availability.`;
}

export function cartWhatsAppMessage(storeName, items = []) {
  const lines = items.map((item, index) => {
    const name = item?.name || 'Item';
    const price = item?.sale_price || item?.price || 0;
    const qty = item?.quantity || 1;
    return `${index + 1}. ${name} (${qty} x ${formatCurrency(price)}) = ${formatCurrency(price * qty)}`;
  });
  
  const total = items.reduce((sum, item) => {
    const price = item?.sale_price || item?.price || 0;
    const qty = item?.quantity || 1;
    return sum + (price * qty);
  }, 0);
  
  return `Hello ${storeName || 'Store'},

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
