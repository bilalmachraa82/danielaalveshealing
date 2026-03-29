import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/351914173445?text=' + encodeURIComponent('Olá Daniela, gostaria de adquirir um Cheque-Oferta.');

const GiftVoucher = () => {
  const { t, lang } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const voucherImage = lang === 'pt'
    ? 'https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/cheque-oferta-pt.jpg'
    : 'https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/cheque-oferta-en.jpg';

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
      <div className="absolute top-1/5 left-1/3 w-1 h-1 rounded-full bg-gold/25 animate-float-gentle" style={{ animationDelay: '3s' }} />

      {/* Botanical SVG */}
      <svg className="absolute bottom-16 right-0 w-48 h-48 text-gold/[0.04] pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.4">
        <path d="M100 20C100 60 60 100 20 100C60 100 100 140 100 180C100 140 140 100 180 100C140 100 100 60 100 20Z" />
        <circle cx="100" cy="100" r="30" />
      </svg>

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Image with gold border effect — editorial overlap */}
          <div className="relative md:-mr-8 lg:-mr-12">
            {/* Outer decorative frame */}
            <div className="absolute -inset-3 border border-gold/20 rounded-2xl" />
            {/* Gold gradient shadow */}
            <div className="absolute -inset-1 bg-gradient-to-br from-gold/10 via-transparent to-gold/5 rounded-2xl blur-sm" />
            <div className="rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <img
                src={voucherImage}
                alt={t('Cheque-Oferta Daniela Alves Healing & Wellness', 'Gift Voucher Daniela Alves Healing & Wellness')}
                className="w-full h-auto"
                width={600}
                height={400}
                loading="lazy"
              />
            </div>
            {/* Overlap accent */}
            <div className="absolute -bottom-6 -right-6 w-40 h-40 bg-gold/[0.06] rounded-full blur-2xl" />
          </div>

          {/* Text */}
          <div className="relative">
            {/* Large decorative quote mark */}
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
