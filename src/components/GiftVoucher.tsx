import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/351914173445?text=' + encodeURIComponent('Olá Daniela, gostaria de adquirir um Cheque-Oferta.');

const GiftVoucher = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-20 lg:py-28 bg-gradient-to-br from-cream via-background to-mist">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Image */}
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/cheque-oferta-pt.jpg"
              alt={t('Cheque-Oferta', 'Gift Voucher')}
              className="w-full h-auto"
              loading="lazy"
            />
          </div>

          {/* Text */}
          <div>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-primary tracking-wider mb-8">
              {t('Cheque-Oferta', 'Gift Voucher')}
            </h2>
            <div className="space-y-4 text-muted-foreground leading-relaxed mb-6">
              <p>{t('Aquela prenda que não se esquece, pois é sentida e vivida!', 'A gift that is never forgotten, because it is felt and lived!')}</p>
              <p>{t('Oferece Amor, em forma de Saúde e Bem-Estar!', 'Gift Love, in the form of Health and Well-Being!')}</p>
              <p>{t('Oferece um momento de relaxamento de qualidade e de Harmonia Interior.', 'Gift a moment of quality relaxation and Inner Harmony.')}</p>
            </div>
            <p className="text-sm text-muted-foreground/80 mb-8 italic">
              {t(
                'O Cheque-Oferta existe em formato físico ou digital e se quiseres adquirir basta entrares em contacto comigo.',
                'The Gift Voucher is available in physical or digital format — just get in touch to purchase.'
              )}
            </p>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
              <Button className="bg-secondary hover:bg-secondary/90 text-secondary-foreground gap-2 rounded-full px-8">
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
