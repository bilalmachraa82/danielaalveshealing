import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="contacto" className="relative bg-gradient-to-b from-foreground to-foreground/95 text-primary-foreground pt-20 pb-10 overflow-hidden">
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-3xl font-extralight tracking-[0.15em] mb-2">Daniela Alves</h3>
            <p className="text-[9px] tracking-[0.3em] uppercase text-primary-foreground/40 mb-6">Healing & Wellness</p>
            <div className="section-divider !mx-0 !w-10 mb-6" />
            <p className="text-xs tracking-wider text-primary-foreground/30 leading-relaxed">
              {t('Terapias Holísticas em Sintra — Sessões de cura e bem-estar para corpo e alma.', 'Holistic Therapies in Sintra — Healing and wellness sessions for body and soul.')}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-gold/80 mb-6">{t('Contacto', 'Contact')}</h4>
            <a href="tel:+351914173445" className="flex items-center gap-3 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              <Phone className="h-3.5 w-3.5 text-gold/60" /> +351 914 173 445
            </a>
            <a href="mailto:daniela@danielaalveshealing.com" className="flex items-center gap-3 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              <Mail className="h-3.5 w-3.5 text-gold/60" /> daniela@danielaalveshealing.com
            </a>
            <a href="https://maps.google.com/?q=R.+do+Regueiro+do+Tanque+3,+Fontanelas,+Sintra" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-primary-foreground/50 hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gold/60" />
              <span>R. do Regueiro do Tanque 3, Fontanelas,<br />São João das Lampas, 2705-415 Sintra</span>
            </a>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-gold/80 mb-6">{t('Redes Sociais', 'Social Media')}</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/danielaalves_healing/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all duration-300" aria-label="Instagram">
                <Instagram className="h-4 w-4 text-primary-foreground/50" />
              </a>
              <a href="https://www.youtube.com/@danielaalves-healingwellness" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/10 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all duration-300" aria-label="YouTube">
                <Youtube className="h-4 w-4 text-primary-foreground/50" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-primary-foreground/5 text-center text-[10px] tracking-[0.15em] text-primary-foreground/25">
          © 2026 Daniela Alves Healing & Wellness. {t('Todos os direitos reservados.', 'All rights reserved.')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
