import { useLanguage } from '@/contexts/LanguageContext';
import { Phone, Mail, MapPin, Instagram, Youtube } from 'lucide-react';

const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer id="contacto" className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid md:grid-cols-3 gap-10 lg:gap-16">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-2xl font-light tracking-wider mb-2">Daniela Alves</h3>
            <p className="text-[10px] tracking-[0.25em] uppercase text-primary-foreground/60 mb-4">Healing & Wellness</p>
            <p className="text-xs tracking-[0.15em] uppercase text-primary-foreground/40">{t('Terapias Holísticas em Sintra', 'Holistic Therapies in Sintra')}</p>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="font-serif text-lg font-light tracking-wider mb-4">{t('Contacto', 'Contact')}</h4>
            <a href="tel:+351914173445" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <Phone className="h-4 w-4" /> +351 914 173 445
            </a>
            <a href="mailto:daniela@danielaalveshealing.com" className="flex items-center gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <Mail className="h-4 w-4" /> daniela@danielaalveshealing.com
            </a>
            <a href="https://maps.google.com/?q=R.+do+Regueiro+do+Tanque+3,+Fontanelas,+Sintra" target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-primary-foreground/70 hover:text-primary-foreground transition-colors">
              <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
              <span>R. do Regueiro do Tanque 3, Fontanelas,<br />São João das Lampas, 2705-415 Sintra</span>
            </a>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-serif text-lg font-light tracking-wider mb-4">{t('Redes Sociais', 'Social Media')}</h4>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/danielaalves_healing/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors" aria-label="Instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="https://www.youtube.com/@danielaalves-healingwellness" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/20 flex items-center justify-center hover:bg-primary-foreground/10 transition-colors" aria-label="YouTube">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-primary-foreground/10 text-center text-xs text-primary-foreground/40">
          © 2026 Daniela Alves Healing & Wellness. {t('Todos os direitos reservados.', 'All rights reserved.')}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
