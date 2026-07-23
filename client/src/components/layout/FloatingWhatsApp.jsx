import { MessageCircle } from 'lucide-react';
import { business } from '../../constants/store.js';

export function FloatingWhatsApp() {
  return (
    <a className="floating-whatsapp" href={`https://wa.me/${business.whatsapp}`} aria-label="Chat on WhatsApp">
      <MessageCircle size={24} />
    </a>
  );
}
