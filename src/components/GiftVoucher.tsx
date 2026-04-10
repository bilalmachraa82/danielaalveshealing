import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const GiftVoucher = () => {
  const { t } = useLanguage();
  const config = useTherapist();
  const WA_LINK = `${config.whatsappBase}?text=${encodeURIComponent(t('Olá Daniela, gostaria de adquirir um Cheque-Oferta.', 'Hello Daniela, I would like to purchase a Gift Voucher.'))}`;

  const { ref, isVisible } = useScrollAnimation();

  return (
    <section
      className="py-24 lg:py-36 relative overflow-hidden noise-overlay"
      style={{
        background: 'radial-gradient(circle at 24% 45%, hsl(var(--gold) / 0.20) 0%, transparent 30%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.14) 0%, transparent 28%), linear-gradient(135deg, hsl(var(--section-warm)) 0%, hsl(var(--section-warm-soft)) 48%, hsl(var(--section-blush)) 100%)',
      }}
    >
      {/* Radial gold glow */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.12] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.10] rounded-full blur-3xl pointer-events-none" />

      {/* Floating gold accents */}
      <div className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-gold/15 animate-float-gentle" />
      <div className="absolute bottom-1/4 left-10 w-1.5 h-1.5 rounded-full bg-gold/20 animate-float-gentle" style={{ animationDelay: '1.5s' }} />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Voucher card — CSS-rendered with brand guidelines */}
          <div className="relative md:-mr-8 lg:-mr-12">
            <div className="absolute -inset-3 border border-gold/20 rounded-2xl" />
            <div className="absolute -inset-1 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 rounded-2xl blur-sm" />
            <div
              className="relative z-10 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(160deg, #3B2635 0%, #2E1D28 40%, #231620 100%)',
                aspectRatio: '3 / 2',
              }}
            >
              {/* Subtle radial glow inside card */}
              <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[rgba(180,141,83,0.06)] rounded-full blur-[60px]" />
              <div className="absolute bottom-0 right-0 w-[200px] h-[200px] bg-[rgba(150,86,138,0.05)] rounded-full blur-[50px]" />

              {/* Gold border accent */}
              <div className="absolute inset-3 sm:inset-4 border border-[rgba(205,174,124,0.15)] rounded-lg" />

              {/* Corner ornaments */}
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-5 h-5 border-t border-l border-[rgba(205,174,124,0.3)]" />
              <div className="absolute top-3 right-3 sm:top-4 sm:right-4 w-5 h-5 border-t border-r border-[rgba(205,174,124,0.3)]" />
              <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 w-5 h-5 border-b border-l border-[rgba(205,174,124,0.3)]" />
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-5 h-5 border-b border-r border-[rgba(205,174,124,0.3)]" />

              {/* Content */}
              <div className="relative z-10 flex flex-col items-center justify-center h-full px-6 sm:px-10 py-8">
                {/* Symbol */}
                <img
                  src="/images/symbol-gold.png"
                  alt=""
                  className="w-auto h-10 sm:h-12 mb-4 opacity-70"
                />

                {/* Title */}
                <h3
                  className="text-center mb-1"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: 'clamp(1.6rem, 4vw, 2.4rem)',
                    fontWeight: 300,
                    letterSpacing: '0.15em',
                    color: 'rgba(245, 240, 230, 0.9)',
                  }}
                >
                  {t('Cheque-Oferta', 'Gift Voucher')}
                </h3>

                {/* Tagline */}
                <p
                  className="text-center mb-4"
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: 'clamp(0.7rem, 1.8vw, 0.85rem)',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    letterSpacing: '0.3em',
                    color: 'rgba(205, 174, 124, 0.6)',
                  }}
                >
                  {t('Sessão Healing Touch', 'Healing Touch Session')}
                </p>

                {/* Gold divider */}
                <div className="w-16 h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(205,174,124,0.5), transparent)' }} />

                {/* From / To fields */}
                <div className="w-full max-w-[260px] space-y-3 mb-5">
                  <div className="flex items-baseline gap-3">
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '0.8rem', color: 'rgba(205,174,124,0.5)', letterSpacing: '0.15em', fontWeight: 300 }}>
                      {t('De', 'From')}
                    </span>
                    <div className="flex-1 border-b border-[rgba(205,174,124,0.15)]" />
                  </div>
                  <div className="flex items-baseline gap-3">
                    <span style={{ fontFamily: '"Cormorant Garamond", serif', fontSize: '0.8rem', color: 'rgba(205,174,124,0.5)', letterSpacing: '0.15em', fontWeight: 300 }}>
                      {t('Para', 'To')}
                    </span>
                    <div className="flex-1 border-b border-[rgba(205,174,124,0.15)]" />
                  </div>
                </div>

                {/* Gold divider */}
                <div className="w-10 h-px mb-4" style={{ background: 'linear-gradient(90deg, transparent, rgba(205,174,124,0.3), transparent)' }} />

                {/* Brand */}
                <p
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '0.75rem',
                    fontWeight: 300,
                    letterSpacing: '0.18em',
                    color: 'rgba(245, 240, 230, 0.45)',
                  }}
                >
                  {config.name}
                </p>
                <p
                  style={{
                    fontFamily: '"Cormorant Garamond", serif',
                    fontSize: '0.55rem',
                    fontWeight: 300,
                    fontStyle: 'italic',
                    letterSpacing: '0.25em',
                    color: 'rgba(205, 174, 124, 0.35)',
                  }}
                >
                  {config.tagline}
                </p>
              </div>
            </div>
            {/* Overlap accent */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gold/[0.06] rounded-full blur-2xl" />
          </div>

          {/* Text */}
          <div className="relative">
            <span className="absolute -top-8 -left-6 font-serif text-[10rem] leading-none text-gold/[0.06] select-none pointer-events-none">"</span>

            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4 relative z-10">{t('Oferta Especial', 'Special Gift')}</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-8 relative z-10 text-balance">
              {t('Cheque-Oferta', 'Gift Voucher')}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6 text-pretty relative z-10">
              <p>{t('Aquela prenda que não se esquece, pois é sentida e vivida!', 'A gift that is never forgotten — because it is felt and experienced.')}</p>
              <p>{t('Oferece Amor, em forma de Saúde e Bem-Estar!', 'Offer Love, in the form of Health and Well-Being.')}</p>
              <p>{t('Oferece um momento de relaxamento de qualidade e de Harmonia Interior.', 'Offer a moment of quality relaxation and Inner Harmony.')}</p>
            </div>
            <p className="text-xs text-muted-foreground/60 mb-10 italic relative z-10">
              {t(
                'O Cheque-Oferta existe em formato físico ou digital e se quiseres adquirir basta entrares em contacto comigo.',
                'The Gift Voucher is available in physical or digital format — just get in touch to purchase.'
              )}
            </p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-block">
              <Button className="bg-gold hover:bg-gold-dark text-white gap-2 rounded-full px-8 text-xs tracking-[0.12em] uppercase shadow-lg hover:shadow-xl transition-all">
                <MessageCircle className="h-4 w-4" />
                {t('Adquirir Cheque-Oferta', 'Get Gift Voucher')}
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GiftVoucher;
