import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/351914173445?text=' + encodeURIComponent('Olá Daniela, gostaria de adquirir um Cheque-Oferta.');

const GiftVoucher = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 lg:py-36 bg-gradient-to-br from-cream via-background to-mist relative overflow-hidden">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Image with gold border effect */}
          <div className="relative">
            {/* Outer decorative frame */}
            <div className="absolute -inset-3 border border-gold/20 rounded-2xl" />
            <div className="rounded-2xl overflow-hidden shadow-2xl relative z-10">
              <img
                src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/cheque-oferta-pt.jpg"
                alt={t('Cheque-Oferta', 'Gift Voucher')}
                className="w-full h-auto"
                loading="lazy"
              />
            </div>
            {/* Overlap accent */}
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-gold/5 rounded-full blur-2xl" />
          </div>

          {/* Text */}
          <div className="relative">
            {/* Large decorative quote mark */}
            <span className="absolute -top-8 -left-6 font-serif text-[10rem] leading-none text-gold/5 select-none pointer-events-none">"</span>

            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4 relative z-10">{t('Oferta Especial', 'Special Gift')}</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-8 relative z-10 text-balance">
              {t('Cheque-Oferta', 'Gift Voucher')}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6 text-pretty relative z-10">
              <p>{t('Aquela prenda que não se esquece, pois é sentida e vivida!', 'A gift that is never forgotten, because it is felt and lived!')}</p>
              <p>{t('Oferece Amor, em forma de Saúde e Bem-Estar!', 'Gift Love, in the form of Health and Well-Being!')}</p>
              <p>{t('Oferece um momento de relaxamento de qualidade e de Harmonia Interior.', 'Gift a moment of quality relaxation and Inner Harmony.')}</p>
            </div>
            <p className="text-xs text-muted-foreground/60 mb-10 italic relative z-10">
              {t(
                'O Cheque-Oferta existe em formato físico ou digital e se quiseres adquirir basta entrares em contacto comigo.',
                'The Gift Voucher is available in physical or digital format — just get in touch to purchase.'
              )}
            </p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="relative z-10 inline-block">
              <Button className="bg-gold hover:bg-gold-dark text-white gap-2 rounded-full px-8 text-xs tracking-[0.12em] uppercase shadow-lg">
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
