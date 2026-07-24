import { MessageCircle } from 'lucide-react';
import { useWhatsApp } from '../../hooks/useWhatsApp.js';

export function FloatingWhatsApp() {
  const { openChat, isConfigured } = useWhatsApp();
  
  if (!isConfigured) return null;

  return (
    <button className="floating-whatsapp" onClick={openChat} aria-label="Chat on WhatsApp">
      <MessageCircle size={24} color="#fff" />
    </button>
  );
}
