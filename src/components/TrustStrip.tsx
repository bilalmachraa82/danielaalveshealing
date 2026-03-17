import { useLanguage } from '@/contexts/LanguageContext';
import { Star, Award, MapPin } from 'lucide-react';

const TrustStrip = () => {
  const { t } = useLanguage();

  return (
    <section className="relative z-20 -mt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto rounded-2xl px-8 py-5 shadow-xl border border-gold/20" style={{
          background: 'linear-gradient(135deg, hsl(300 20% 14% / 0.92) 0%, hsl(295 22% 11% / 0.95) 100%)',
          backdropFilter: 'blur(24px)',
        }}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-0 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <span className="text-xs tracking-wide text-white/90">5.0 Google — 23 {t('avaliações', 'reviews')}</span>
            </div>
            <span className="hidden sm:block mx-6 w-1 h-1 rounded-full bg-gold/50" />
            <div className="flex items-center gap-2">
              <Award className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs tracking-wide text-white/90">{t('15+ anos de experiência', '15+ years of experience')}</span>
            </div>
            <span className="hidden sm:block mx-6 w-1 h-1 rounded-full bg-gold/50" />
            <div className="flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5 text-gold" />
              <span className="text-xs tracking-wide text-white/90">Sintra, Portugal</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustStrip;
