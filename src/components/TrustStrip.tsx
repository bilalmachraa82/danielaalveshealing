import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Award, MapPin } from 'lucide-react';

const TrustStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="bg-subtle border-y border-border/50 py-4">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="flex text-secondary">
            {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
          </div>
          <span>5.0 Google — 23 {t('avaliações', 'reviews')}</span>
        </div>
        <span className="hidden sm:block mx-6 h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <Award className="h-3.5 w-3.5 text-secondary" />
          <span>{t('15+ anos de experiência', '15+ years of experience')}</span>
        </div>
        <span className="hidden sm:block mx-6 h-4 w-px bg-border" />
        <div className="flex items-center gap-2">
          <MapPin className="h-3.5 w-3.5 text-secondary" />
          <span>Sintra, Portugal</span>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
