import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const SpaceHarmony = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section id="espaco" className="py-24 lg:py-36 relative overflow-hidden">
      {/* Immersive background image with overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1920&q=80")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }} />
      <div className="absolute inset-0 bg-foreground/80 backdrop-blur-sm" />

      {/* Botanical pattern overlay */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 5c0 15-10 25-25 25C20 30 30 40 30 55c0-15 10-25 25-25C40 30 30 20 30 5z' fill='none' stroke='%23C4A265' stroke-width='0.5'/%3E%3C/svg%3E")`,
        backgroundSize: '60px 60px',
      }} />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section header */}
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Espaços', 'Spaces')}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-white tracking-wider mb-6 text-balance">
            {t('Cuidar do Teu Espaço', 'Caring for Your Space')}
          </h2>
          <div className="section-divider" />
        </div>

        {/* Asymmetric card */}
        <div className={`max-w-4xl mx-auto grid md:grid-cols-5 gap-8 items-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Left — icon + decorative */}
          <div className="md:col-span-2 flex flex-col items-center">
            <div className="w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center mb-6 animate-float-gentle bg-white/5 backdrop-blur-sm">
              <Home className="h-10 w-10 text-gold" strokeWidth={1} />
            </div>
            <p className="font-serif text-3xl md:text-4xl font-extralight text-white tracking-wider text-center">
              Home Harmony
            </p>
          </div>

          {/* Right — text */}
          <div className="md:col-span-3 relative">
            <span className="absolute -top-6 -left-4 font-serif text-8xl text-gold/10 leading-none select-none">"</span>
            <p className="text-white/70 leading-relaxed text-pretty mb-4 relative z-10">
              {t(
                'Se o corpo é o Templo onde habitamos, a casa é o espaço que nos acolhe e sustenta no dia-a-dia. Quando a casa está harmoniosa, as várias áreas da nossa vida fluem com mais leveza, alegria, saúde e bem-estar.',
                'If the body is the Temple where we dwell, the home is the space that welcomes and sustains us daily. When the home is harmonious, various areas of our life flow with more lightness, joy, health and well-being.'
              )}
            </p>
            <p className="font-serif italic text-base md:text-lg text-gold/70 mb-8">
              {t('"Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!"', '"May your Home be a true Haven that amplifies your Inner Harmony!"')}
            </p>
            <Link to="/home-harmony">
              <Button
                variant="ghost"
                className="rounded-full text-xs tracking-[0.15em] uppercase text-white/60 hover:text-white hover:bg-white/10"
              >
                {t('Saber mais', 'Learn more')} →
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpaceHarmony;
