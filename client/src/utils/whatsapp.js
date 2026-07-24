export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
}

export function buildWhatsAppUrl(phone, message) {
  if (!phone) return '#';
  const cleanPhone = String(phone).replace(/\D/g, '');
  if (!cleanPhone) return '#';
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message || '')}`;
}

export function resolveProductImage(product) {
  if (!product) return '';
  if (typeof product.thumbnail === 'string' && product.thumbnail) return product.thumbnail;
  if (typeof product.featured_image === 'string' && product.featured_image) return product.featured_image;
  if (Array.isArray(product.images) && product.images[0]) return typeof product.images[0] === 'string' ? product.images[0] : product.images[0].url || '';
  if (Array.isArray(product.gallery) && product.gallery[0]) return typeof product.gallery[0] === 'string' ? product.gallery[0] : product.gallery[0].url || '';
  if (typeof product.image === 'string' && product.image) return product.image;
  return '';
}

export function resolveProductUrl(product) {
  if (!product?.slug) return window.location.href;
  return `${window.location.origin}/product/${product.slug}`;
}

export function productWhatsAppMessage(storeName, product, quantity = 1, currentUrl = '') {
  const name = product?.name || 'Product';
  const sku = product?.sku || 'N/A';
  const price = product?.sale_price || product?.price || 0;
  const image = resolveProductImage(product);
  const link = currentUrl || resolveProductUrl(product);
  
  let msg = `🛍 New Order Inquiry

Hello ${storeName || 'Store'},

I would like to order the following product.

━━━━━━━━━━━━━━━━━━━━━━

📦 Product
${name}

🆔 SKU
${sku}

💰 Price
${formatCurrency(price)}

🔢 Quantity
${quantity}

💵 Subtotal
${formatCurrency(price * quantity)}`;

  if (image) {
    msg += `\n\n🖼 Product Image\n${image}`;
  }

  msg += `\n\n🔗 Product Page\n${link}

━━━━━━━━━━━━━━━━━━━━━━

👤 Customer Name
____________________

📞 Mobile Number
____________________

📍 Delivery Address
____________________

📝 Additional Notes
____________________

Please confirm product availability and the final order details.

Thank you!`;
  return msg;
}

const numEmojis = ['0️⃣', '1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
const getEmojiNum = (num) => num <= 10 ? numEmojis[num] : `${num}.`;

export function cartWhatsAppMessage(storeName, items = []) {
  const lines = items.map((item, index) => {
    const name = item?.name || 'Item';
    const sku = item?.sku || 'N/A';
    const price = item?.sale_price || item?.price || 0;
    const qty = item?.quantity || 1;
    const image = resolveProductImage(item);
    const link = resolveProductUrl(item);
    
    let str = `${getEmojiNum(index + 1)} ${name}\n\nSKU\n${sku}\n\nQuantity\n${qty}\n\nPrice\n${formatCurrency(price)}\n\nSubtotal\n${formatCurrency(price * qty)}`;
    
    if (image) str += `\n\n🖼 Image\n${image}`;
    str += `\n\n🔗 Product Link\n${link}`;
    return str;
  });
  
  const total = items.reduce((sum, item) => {
    const price = item?.sale_price || item?.price || 0;
    const qty = item?.quantity || 1;
    return sum + (price * qty);
  }, 0);
  
  return `🛍 New Order Inquiry

Hello ${storeName || 'Store'},

I would like to place the following order.

━━━━━━━━━━━━━━━━━━━━━━

${lines.join('\n\n----------------------------\n\n')}

━━━━━━━━━━━━━━━━━━━━━━

💰 Grand Total
${formatCurrency(total)}

━━━━━━━━━━━━━━━━━━━━━━

👤 Customer Name
____________________

📞 Mobile Number
____________________

📍 Delivery Address
____________________

📝 Additional Notes
____________________

Please confirm product availability.

Thank you!`;
}
