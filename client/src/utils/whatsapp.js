import { business } from '../constants/store.js';

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(value);
}

export function buildWhatsAppUrl(message) {
  return `https://wa.me/${business.whatsapp}?text=${encodeURIComponent(message)}`;
}

export function productWhatsAppMessage(product, quantity = 1) {
  return `Hello ${business.name}, I want to order ${quantity} x ${product.name} (${product.sku}) for ${formatCurrency(product.price)}.`;
}

export function cartWhatsAppMessage(items) {
  const lines = items.map((item, index) => `${index + 1}. ${item.quantity} x ${item.name} - ${formatCurrency(item.price * item.quantity)}`);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  return `Hello ${business.name}, I want to place this order:\n\n${lines.join('\n')}\n\nTotal: ${formatCurrency(total)}\n\nPlease confirm availability.`;
}
