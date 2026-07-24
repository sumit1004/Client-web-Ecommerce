import { MessageCircle } from 'lucide-react';
import { useSettings } from '../../context/AppProviders.jsx';

export function FloatingWhatsApp() {
  const { business } = useSettings();

  if (!business?.whatsapp) return null;

  return (
    <a className="floating-whatsapp" href={`https://wa.me/${business.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" aria-label="Chat on WhatsApp">
      <MessageCircle size={24} />
    </a>
  );
}
