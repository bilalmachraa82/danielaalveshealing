import { MessageCircle } from 'lucide-react';
import { DEFAULT_CONFIG } from '@/lib/config/therapist';

const WA_LINK = `${DEFAULT_CONFIG.whatsappBase}?text=${encodeURIComponent('Olá Daniela, gostaria de saber mais sobre os seus serviços.')}`;

const WhatsAppFloat = () => (
  <a
    href={WA_LINK}
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-whatsapp text-whatsapp-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform animate-pulse-ring"
    aria-label="WhatsApp"
  >
    <MessageCircle className="h-6 w-6" />
  </a>
);

export default WhatsAppFloat;
