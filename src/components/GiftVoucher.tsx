import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { MessageCircle, RotateCw, Phone, Globe, Instagram, Facebook } from 'lucide-react';

const GiftVoucher = () => {
  const { t } = useLanguage();
  const config = useTherapist();
  const [isFlipped, setIsFlipped] = useState(false);

  const WA_LINK = `${config.whatsappBase}?text=${encodeURIComponent(
    t(
      'Olá Daniela, gostaria de adquirir um Cheque-Oferta.',
      'Hello Daniela, I would like to purchase a Gift Voucher.'
    )
  )}`;

  const { ref, isVisible } = useScrollAnimation();

  const toggleFlip = () => setIsFlipped((prev) => !prev);

  return (
    <section
      className="py-24 lg:py-36 relative overflow-hidden noise-overlay"
      style={{
        background:
          'radial-gradient(circle at 24% 45%, hsl(var(--gold) / 0.20) 0%, transparent 30%), radial-gradient(circle at 80% 80%, hsl(var(--primary) / 0.14) 0%, transparent 28%), linear-gradient(135deg, hsl(var(--section-warm)) 0%, hsl(var(--section-warm-soft)) 48%, hsl(var(--section-blush)) 100%)',
      }}
    >
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] bg-gold/[0.12] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-primary/[0.10] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-gold/15 animate-float-gentle" />
      <div
        className="absolute bottom-1/4 left-10 w-1.5 h-1.5 rounded-full bg-gold/20 animate-float-gentle"
        style={{ animationDelay: '1.5s' }}
      />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div
          className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* === Flip card (frente + verso) === */}
          <div className="relative md:-mr-4 lg:-mr-8">
            <div className="absolute -inset-3 border border-gold/20 rounded-2xl pointer-events-none" />
            <div className="absolute -inset-1 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 rounded-2xl blur-sm pointer-events-none" />

            <div
              className="relative w-full"
              style={{ aspectRatio: '1.75 / 1', perspective: '1800px' }}
            >
              <button
                type="button"
                onClick={toggleFlip}
                aria-label={t('Virar cheque-oferta', 'Flip gift voucher')}
                aria-pressed={isFlipped}
                className="absolute inset-0 w-full h-full rounded-xl cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-4"
                style={{
                  transformStyle: 'preserve-3d',
                  transition: 'transform 900ms cubic-bezier(0.4, 0.0, 0.2, 1)',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                }}
              >
                {/* FRENTE */}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(59,38,53,0.18)] noise-overlay text-left"
                  style={{
                    background:
                      'linear-gradient(170deg, #FDFAF5 0%, #F8F4ED 55%, #F4EFE6 100%)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div className="absolute top-0 right-0 w-[260px] h-[260px] bg-[hsl(var(--gold)/0.10)] rounded-full blur-[70px] pointer-events-none" />
                  <div className="absolute -bottom-12 -left-12 w-[220px] h-[220px] bg-[hsl(var(--primary)/0.06)] rounded-full blur-[70px] pointer-events-none" />

                  {/* Watermark logo */}
                  <picture>
                    <source srcSet="/images/logo-dark.webp" type="image/webp" />
                    <img
                      src="/images/logo-dark.png"
                      alt=""
                      aria-hidden
                      className="absolute -right-8 -bottom-8 w-[60%] max-w-[340px] opacity-[0.05] pointer-events-none select-none"
                      loading="lazy"
                    />
                  </picture>

                  <div className="absolute inset-[14px] border-[0.5px] border-[hsl(var(--gold)/0.22)] rounded-lg pointer-events-none" />
                  <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-gold/50 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-gold/50 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-gold/50 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-gold/50 pointer-events-none" />

                  <div className="relative z-10 h-full flex flex-col px-8 sm:px-12 py-7 sm:py-9">
                    <div className="flex items-start justify-between gap-4">
                      <picture>
                        <source srcSet="/images/logo-h-dark.webp" type="image/webp" />
                        <img
                          src="/images/logo-h-dark.png"
                          alt={config.name}
                          className="w-24 sm:w-[130px] h-auto object-contain mix-blend-multiply opacity-90"
                          loading="lazy"
                        />
                      </picture>
                      <p className="font-sans text-[0.65rem] sm:text-[0.7rem] uppercase tracking-[0.28em] text-[hsl(var(--gold))] font-medium pt-1">
                        {t('Oferta Especial', 'Special Gift')}
                      </p>
                    </div>

                    <div className="flex-1 flex flex-col items-center justify-center text-center -mt-2 sm:-mt-3">
                      <h3
                        className="font-serif italic text-foreground leading-[0.95]"
                        style={{ fontSize: 'clamp(2.2rem, 4.2vw, 3.6rem)' }}
                      >
                        {t('Cheque-Oferta', 'Gift Voucher')}
                      </h3>

                      <div className="flex items-center gap-2 mt-2 sm:mt-3">
                        <span className="w-8 sm:w-10 h-px bg-gold/50" />
                        <span className="w-1 h-1 rounded-full bg-gold/70" />
                        <span className="w-8 sm:w-10 h-px bg-gold/50" />
                      </div>

                      <p className="font-serif text-[0.9rem] sm:text-[1.05rem] text-foreground/70 italic mt-2 sm:mt-3 tracking-wide">
                        {t('Sessão Healing Touch', 'Healing Touch Session')}
                      </p>

                      <div className="w-full max-w-[280px] mt-5 sm:mt-6 space-y-3">
                        <div className="flex items-baseline gap-3">
                          <span className="font-sans text-[0.78rem] sm:text-[0.82rem] uppercase tracking-[0.18em] text-foreground/75 font-medium shrink-0 w-10 text-left">
                            {t('Para', 'To')}
                          </span>
                          <span className="flex-1 border-b border-foreground/25 h-6" />
                        </div>
                        <div className="flex items-baseline gap-3">
                          <span className="font-sans text-[0.78rem] sm:text-[0.82rem] uppercase tracking-[0.18em] text-foreground/75 font-medium shrink-0 w-10 text-left">
                            {t('De', 'From')}
                          </span>
                          <span className="flex-1 border-b border-foreground/25 h-6" />
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto">
                      <div className="flex items-center justify-center gap-2 mb-2.5">
                        <span className="w-8 h-px bg-gold/40" />
                        <span className="w-1 h-1 rounded-full bg-gold/55" />
                        <span className="w-8 h-px bg-gold/40" />
                      </div>
                      <div className="font-sans text-[0.72rem] sm:text-[0.76rem] text-foreground/75 flex flex-col items-center gap-1">
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-gold" aria-hidden />
                            {config.phoneFormatted}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Globe className="w-3 h-3 text-gold" aria-hidden />
                            danielaalveshealing.com
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
                          <span className="inline-flex items-center gap-1.5">
                            <Instagram className="w-3 h-3 text-gold" aria-hidden />
                            @danielaalves_healing
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Facebook className="w-3 h-3 text-gold" aria-hidden />
                            Daniela Alves Healing
                          </span>
                        </div>
                      </div>
                      <p className="font-serif italic text-[0.72rem] sm:text-[0.78rem] text-[hsl(var(--gold))] text-center mt-2 tracking-wide">
                        {t(
                          'Válido 3 meses após aquisição',
                          'Valid for 3 months after purchase'
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* VERSO */}
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden shadow-[0_30px_60px_-15px_rgba(59,38,53,0.28)] flex items-center justify-center"
                  style={{
                    background:
                      'linear-gradient(160deg, #4A2C3F 0%, #3B2635 45%, #2E1D28 100%)',
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="absolute inset-[14px] border-[0.5px] border-gold/25 rounded-lg pointer-events-none" />
                  <div className="absolute top-4 left-4 w-5 h-5 border-t border-l border-gold/40 pointer-events-none" />
                  <div className="absolute top-4 right-4 w-5 h-5 border-t border-r border-gold/40 pointer-events-none" />
                  <div className="absolute bottom-4 left-4 w-5 h-5 border-b border-l border-gold/40 pointer-events-none" />
                  <div className="absolute bottom-4 right-4 w-5 h-5 border-b border-r border-gold/40 pointer-events-none" />

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-gold/[0.07] rounded-full blur-[80px] pointer-events-none" />

                  {/* Watermark logo (symbol, large, faded) */}
                  <picture>
                    <source srcSet="/images/logo.webp" type="image/webp" />
                    <img
                      src="/images/logo.png"
                      alt=""
                      aria-hidden
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[420px] opacity-[0.06] pointer-events-none select-none"
                      loading="lazy"
                    />
                  </picture>

                  <div className="relative z-10 flex flex-col items-center justify-center text-center px-8">
                    <picture>
                      <source srcSet="/images/logo-h-light.webp" type="image/webp" />
                      <img
                        src="/images/logo-h-light.png"
                        alt={config.name}
                        className="w-44 sm:w-60 h-auto object-contain opacity-95 drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
                        loading="lazy"
                      />
                    </picture>
                    <div className="flex items-center gap-2 mt-5">
                      <span className="w-12 h-px bg-gold/55" />
                      <span className="w-1 h-1 rounded-full bg-gold/75" />
                      <span className="w-12 h-px bg-gold/55" />
                    </div>
                    <p className="font-serif italic text-gold text-sm sm:text-base mt-4 tracking-[0.2em] uppercase">
                      {t('Beyond the Body', 'Beyond the Body')}
                    </p>
                    <p className="font-sans text-[0.7rem] sm:text-[0.78rem] text-white/60 mt-5 tracking-[0.15em] uppercase">
                      danielaalveshealing.com
                    </p>
                  </div>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={toggleFlip}
              className="mt-5 mx-auto flex items-center gap-2 text-[11px] tracking-[0.2em] uppercase text-foreground/55 hover:text-gold transition-colors"
            >
              <RotateCw className="w-3 h-3" aria-hidden />
              {isFlipped
                ? t('Ver frente', 'Show front')
                : t('Ver verso', 'Show back')}
            </button>

            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gold/[0.06] rounded-full blur-2xl pointer-events-none" />
          </div>

          {/* === Coluna de texto === */}
          <div className="relative">
            <span className="absolute -top-8 -left-6 font-serif text-[10rem] leading-none text-gold/[0.06] select-none pointer-events-none">
              "
            </span>

            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4 relative z-10">
              {t('Oferta Especial', 'Special Gift')}
            </p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-8 relative z-10 text-balance">
              {t('Cheque-Oferta', 'Gift Voucher')}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6 text-pretty relative z-10">
              <p>
                {t(
                  'Aquela prenda que não se esquece, pois é sentida e vivida!',
                  'A gift that is never forgotten — because it is felt and experienced.'
                )}
              </p>
              <p>
                {t(
                  'Oferece Amor, em forma de Saúde e Bem-Estar!',
                  'Offer Love, in the form of Health and Well-Being.'
                )}
              </p>
              <p>
                {t(
                  'Oferece um momento de relaxamento de qualidade e de Harmonia Interior.',
                  'Offer a moment of quality relaxation and Inner Harmony.'
                )}
              </p>
            </div>
            <p className="text-xs text-muted-foreground/70 mb-4 italic relative z-10">
              {t(
                'Disponível em formato físico ou digital. Personalizável para qualquer sessão — Healing Touch, aromaterapia, Home Harmony, Pura Radiância.',
                'Available in physical or digital format. Customisable for any session — Healing Touch, aromatherapy, Home Harmony, Pura Radiância.'
              )}
            </p>
            <p className="text-[11px] text-muted-foreground/60 mb-10 italic relative z-10 tracking-wide">
              {t(
                'Válido 3 meses após aquisição.',
                'Valid for 3 months after purchase.'
              )}
            </p>
            <a
              href={WA_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-10 inline-block"
            >
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
