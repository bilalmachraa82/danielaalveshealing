import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { Phone, Mail, MapPin, Instagram, Youtube, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const { t } = useLanguage();
  const config = useTherapist();

  return (
    <footer id="contacto" className="relative pt-20 pb-10 overflow-hidden noise-overlay text-primary-foreground" style={{
      background: 'linear-gradient(180deg, hsl(300 20% 14%) 0%, hsl(295 22% 11%) 50%, hsl(290 25% 9%) 100%)',
    }}>
      {/* Gold top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />

      {/* Decorative botanical SVG */}
      <svg className="absolute top-16 right-8 w-32 h-32 text-gold/[0.06] pointer-events-none" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.4">
        <path d="M60 10C60 40 40 60 10 60C40 60 60 80 60 110C60 80 80 60 110 60C80 60 60 40 60 10Z" />
        <circle cx="60" cy="60" r="18" />
      </svg>

      {/* Subtle radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gold/[0.03] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[300px] h-[200px] bg-primary/[0.04] rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-12 lg:gap-20">
          {/* Brand */}
          <div>
            <h3 className="font-serif text-3xl font-extralight tracking-[0.15em] mb-2">{config.name}</h3>
            <p className="text-[9px] tracking-[0.3em] uppercase text-primary-foreground/40 mb-6">{config.tagline}</p>
            <div className="section-divider !mx-0 !w-10 mb-6" />
            <p className="text-xs tracking-wider text-primary-foreground/35 leading-relaxed">
              {t('Terapias Holísticas em Sintra — Sessões de cura e harmonia para corpo e alma.', 'Holistic Therapies in Sintra — Beyond the Body. Healing sessions for body and soul.')}
            </p>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-gold/80 mb-6">{t('Contacto', 'Contact')}</h4>
            <a href={`tel:+${config.phone}`} className="flex items-center gap-3 text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              <Phone className="h-3.5 w-3.5 text-gold/60" /> {config.phoneFormatted}
            </a>
            <a href={`mailto:${config.email}`} className="flex items-center gap-3 text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              <Mail className="h-3.5 w-3.5 text-gold/60" /> {config.email}
            </a>
            <a href={config.address.mapsUrl} target="_blank" rel="noopener noreferrer" className="flex items-start gap-3 text-sm text-primary-foreground/55 hover:text-primary-foreground transition-colors duration-300 tracking-wide">
              <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-gold/60" />
              <span>{config.address.street}, {config.address.city},<br />{config.address.postal}</span>
            </a>
          </div>

          {/* Social & Links */}
          <div>
            <h4 className="text-[11px] tracking-[0.3em] uppercase text-gold/80 mb-6">{t('Redes Sociais', 'Social Media')}</h4>
            <div className="flex gap-4 mb-6">
              <a href={config.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/15 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all duration-300" aria-label="Instagram">
                <Instagram className="h-4 w-4 text-primary-foreground/55" />
              </a>
              <a href={config.socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full border border-primary-foreground/15 flex items-center justify-center hover:border-gold/40 hover:bg-gold/5 transition-all duration-300" aria-label="YouTube">
                <Youtube className="h-4 w-4 text-primary-foreground/55" />
              </a>
            </div>
            <a
              href={config.socialLinks.googleReview}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs text-primary-foreground/45 hover:text-gold transition-colors duration-300 tracking-wide"
            >
              <Star className="h-3.5 w-3.5" />
              {t('Avaliar no Google', 'Review on Google')}
            </a>
          </div>
        </div>

        <div className="mt-16 pt-6 border-t border-primary-foreground/8 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 text-[10px] tracking-[0.15em] text-primary-foreground/30">
          <span>© {new Date().getFullYear()} {config.fullBusinessName}. {t('Todos os direitos reservados.', 'All rights reserved.')}</span>
          <Link to="/politica-privacidade" className="hover:text-primary-foreground/60 transition-colors">
            {t('Política de Privacidade', 'Privacy Policy')}
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
