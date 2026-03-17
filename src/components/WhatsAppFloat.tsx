import { MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/351914173445?text=Olá%20Daniela%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20seus%20serviços.';

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
