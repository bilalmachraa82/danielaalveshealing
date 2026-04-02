import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const CTABanner = () => {
  const { t } = useLanguage();
  const config = useTherapist();
  const WA_LINK = `${config.whatsappBase}?text=${encodeURIComponent(t('Olá Daniela, gostaria de agendar uma sessão.', 'Hello Daniela, I would like to book a session.'))}`;

  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      ref={ref}
      className="relative py-24 lg:py-32 overflow-hidden noise-overlay"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--primary) / 0.15) 0%, hsl(var(--gold) / 0.18) 50%, hsl(var(--primary) / 0.12) 100%), linear-gradient(180deg, hsl(var(--section-lilac-strong)) 0%, hsl(var(--section-warm)) 100%)',
      }}
    >
      {/* Radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-gold/[0.08] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/[0.06] rounded-full blur-3xl pointer-events-none" />

      {/* Gold top/bottom lines */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

      {/* Floating accents */}
      <div className="absolute top-1/4 left-12 w-2 h-2 rounded-full bg-gold/20 animate-float-gentle" />
      <div className="absolute bottom-1/3 right-16 w-1.5 h-1.5 rounded-full bg-gold/15 animate-float-gentle" style={{ animationDelay: '2s' }} />

      <div className={`container mx-auto px-4 lg:px-8 relative z-10 text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">
          {t('A Tua Jornada Começa Aqui', 'Your Journey Starts Here')}
        </p>
        <h2 className="font-serif text-4xl md:text-5xl lg:text-7xl font-extralight text-foreground tracking-wider mb-6 text-balance">
          {t('Pronta para Começar?', 'Ready to Begin?')}
        </h2>
        <div className="section-divider mb-8" />
        <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed mb-12 text-pretty">
          {t(
            'Dá o primeiro passo para uma vida mais equilibrada e harmoniosa. Estou aqui para te acompanhar.',
            'Take the first step towards a more balanced and harmonious life. I\'m here to guide you.'
          )}
        </p>
        <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
          <Button
            size="lg"
            className="bg-gold hover:bg-gold-dark text-white gap-3 rounded-full px-12 py-7 text-sm tracking-[0.15em] uppercase shadow-xl hover:shadow-2xl transition-all duration-500 hover:scale-105"
          >
            <MessageCircle className="h-5 w-5" />
            {t('Agendar Sessão', 'Book Session')}
          </Button>
        </a>
      </div>
    </section>
  );
};

export default CTABanner;
