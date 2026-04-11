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
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.12] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.10] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-gold/15 animate-float-gentle" />
      <div className="absolute bottom-1/4 left-10 w-1.5 h-1.5 rounded-full bg-gold/20 animate-float-gentle" style={{ animationDelay: '1.5s' }} />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>

          {/* Cards stack — front + back (verso) */}
          <div className="relative md:-mr-8 lg:-mr-12">
            {/* Outer decorative frame */}
            <div className="absolute -inset-3 border border-gold/20 rounded-2xl" />
            <div className="absolute -inset-1 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 rounded-2xl blur-sm" />

            {/* === VERSO (back) — visible behind front card === */}
            <div
              className="absolute top-3 left-3 right-0 bottom-0 z-0 rounded-2xl shadow-lg"
              style={{
                background: 'linear-gradient(160deg, #3B2635 0%, #2E1D28 50%, #231620 100%)',
              }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <picture>
                  <source srcSet="/images/logo-h-light.webp" type="image/webp" />
                  <img
                    src="/images/logo-h-light.png"
                    alt=""
                    className="w-auto h-10 object-contain opacity-40"
                  />
                </picture>
              </div>
            </div>

            {/* === FRENTE (front) — main display === */}
            <div
              className="relative z-10 rounded-2xl overflow-hidden shadow-2xl"
              style={{
                background: 'linear-gradient(170deg, #FDFAF5 0%, #F8F4ED 50%, #F4EFE6 100%)',
                aspectRatio: '3 / 2',
              }}
            >
              {/* Soft ambient glows */}
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[rgba(205,174,124,0.06)] rounded-full blur-[50px]" />
              <div className="absolute bottom-0 left-0 w-[180px] h-[180px] bg-[rgba(150,86,138,0.03)] rounded-full blur-[40px]" />

              {/* Inner border */}
              <div className="absolute inset-[14px] sm:inset-[18px] border border-[rgba(180,141,83,0.18)] rounded-md pointer-events-none" />

              {/* Content — structured vertical layout */}
              <div className="relative z-10 flex flex-col items-center justify-between h-full px-8 sm:px-12 py-6 sm:py-8">

                {/* Top: Logo */}
                <picture>
                  <source srcSet="/images/logo-h-dark.webp" type="image/webp" />
                  <img
                    src="/images/logo-h-dark.png"
                    alt={config.name}
                    className="w-auto h-7 sm:h-9 object-contain"
                  />
                </picture>

                {/* Center block */}
                <div className="flex flex-col items-center text-center -mt-1">
                  {/* Title */}
                  <h3
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 'clamp(1.8rem, 5vw, 2.6rem)',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      letterSpacing: '0.12em',
                      color: '#3B2635',
                      lineHeight: 1.1,
                    }}
                  >
                    {t('Cheque-Oferta', 'Gift Voucher')}
                  </h3>

                  {/* Gold divider dot pattern */}
                  <div className="flex items-center gap-2 my-2.5">
                    <div className="w-8 h-px bg-[rgba(180,141,83,0.4)]" />
                    <div className="w-1 h-1 rounded-full bg-[rgba(180,141,83,0.5)]" />
                    <div className="w-8 h-px bg-[rgba(180,141,83,0.4)]" />
                  </div>

                  {/* Subtitle — service name */}
                  <p
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: 'clamp(0.75rem, 2vw, 0.95rem)',
                      fontWeight: 400,
                      letterSpacing: '0.15em',
                      color: 'rgba(59,38,53,0.55)',
                    }}
                  >
                    {t('Sessão Healing Touch', 'Healing Touch Session')}
                  </p>

                  {/* From / To fields */}
                  <div className="w-full max-w-[220px] sm:max-w-[260px] space-y-2 mt-5">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="shrink-0"
                        style={{
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: '0.85rem',
                          color: 'rgba(59,38,53,0.4)',
                          letterSpacing: '0.08em',
                          fontWeight: 400,
                        }}
                      >
                        {t('De', 'From')}:
                      </span>
                      <div className="flex-1 border-b border-[rgba(59,38,53,0.1)] min-w-0" />
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span
                        className="shrink-0"
                        style={{
                          fontFamily: '"Cormorant Garamond", serif',
                          fontSize: '0.85rem',
                          color: 'rgba(59,38,53,0.4)',
                          letterSpacing: '0.08em',
                          fontWeight: 400,
                        }}
                      >
                        {t('Para', 'To')}:
                      </span>
                      <div className="flex-1 border-b border-[rgba(59,38,53,0.1)] min-w-0" />
                    </div>
                  </div>
                </div>

                {/* Bottom: contacts + validity */}
                <div className="flex flex-col items-center text-center gap-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-6 h-px bg-[rgba(180,141,83,0.3)]" />
                    <div className="w-0.5 h-0.5 rounded-full bg-[rgba(180,141,83,0.4)]" />
                    <div className="w-6 h-px bg-[rgba(180,141,83,0.3)]" />
                  </div>
                  <p
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.55rem',
                      color: 'rgba(59,38,53,0.45)',
                      letterSpacing: '0.04em',
                      lineHeight: 1.6,
                    }}
                  >
                    {config.phoneFormatted} &nbsp;|&nbsp; danielaalveshealing.com
                  </p>
                  <p
                    style={{
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.55rem',
                      color: 'rgba(59,38,53,0.45)',
                      letterSpacing: '0.04em',
                    }}
                  >
                    IG @danielaalves_healing &nbsp;|&nbsp; FB Daniela Alves Healing
                  </p>
                  <p
                    style={{
                      fontFamily: '"Cormorant Garamond", serif',
                      fontSize: '0.5rem',
                      fontStyle: 'italic',
                      color: 'rgba(180,141,83,0.5)',
                      letterSpacing: '0.06em',
                      marginTop: '2px',
                    }}
                  >
                    {t('Válido até 3 meses após aquisição.', 'Valid 3 months after purchase.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gold/[0.06] rounded-full blur-2xl" />
          </div>

          {/* Text column */}
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
