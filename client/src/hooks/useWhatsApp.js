import { useSettings } from '../context/AppProviders.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { buildWhatsAppUrl, productWhatsAppMessage, cartWhatsAppMessage } from '../utils/whatsapp.js';
import { business as STORE } from '../constants/store.js';

export function useWhatsApp() {
  const { business } = useSettings();
  const toast = useToast();

  const rawNumber = business?.whatsapp || STORE.whatsapp;
  // Ensure we have a valid numeric string for configuration
  const number = typeof rawNumber === 'string' ? rawNumber.replace(/\D/g, '') : '';
  
  const execute = (url, message, generatedUrl) => {
    console.log("Business:", business);
    console.log("WhatsApp:", business?.whatsapp);
    console.log("Sanitized:", number);
    console.log("Message:", message);
    console.log("Generated URL:", generatedUrl);
    
    if (!number) {
      toast.show('WhatsApp number is not configured.', 'error');
      return;
    }
    if (!generatedUrl || generatedUrl === '#') {
      toast.show('Failed to generate WhatsApp link.', 'error');
      return;
    }
    // Hard-validated window open, completely bypassing React Router
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return {
    buyProduct: (product, qty = 1, currentUrl = '') => {
      const message = productWhatsAppMessage(business?.storeName || STORE.shortName || 'Store', product, qty, currentUrl);
      const url = buildWhatsAppUrl(number, message);
      execute(url, message, url);
    },
    checkoutCart: (cartItems) => {
      if (!cartItems?.length) return;
      const message = cartWhatsAppMessage(business?.storeName || STORE.shortName || 'Store', cartItems);
      const url = buildWhatsAppUrl(number, message);
      execute(url, message, url);
    },
    openChat: () => {
      const url = buildWhatsAppUrl(number, 'Hello!');
      execute(url, 'Hello!', url);
    },
    isConfigured: !!number
  };
}
