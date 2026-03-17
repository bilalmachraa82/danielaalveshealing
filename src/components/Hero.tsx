import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.05);

  const words = [
    { pt: 'Serenar', en: 'Soothe' },
    { pt: 'Equilibrar', en: 'Equilibrate' },
    { pt: 'Relaxar', en: 'Relax' },
  ];

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-mist via-background to-cream">
      {/* Organic shape decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-72 h-72 bg-secondary/10 rounded-full blur-3xl" />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 pt-24 pb-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center">
          {/* Video — Left 3 cols */}
          <div className={`lg:col-span-3 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="relative rounded-t-[120px] rounded-b-2xl overflow-hidden shadow-2xl max-w-lg mx-auto lg:mx-0 aspect-[3/4]">
              <video
                autoPlay
                muted
                loop
                playsInline
                poster="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/Moi-optimized.jpg"
                className="w-full h-full object-cover"
              >
                <source src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/hero-video.mp4" type="video/mp4" />
              </video>
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
            </div>
          </div>

          {/* Text — Right 2 cols */}
          <div className={`lg:col-span-2 text-center lg:text-left transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* S.E.R. words */}
            <div className="space-y-2 mb-8">
              {words.map((w, i) => {
                const word = t(w.pt, w.en);
                return (
                  <p key={i} className="font-serif italic text-3xl md:text-4xl lg:text-5xl font-light tracking-wider text-foreground/80"
                     style={{ animationDelay: `${i * 150}ms` }}>
                    <span className="text-primary text-4xl md:text-5xl lg:text-6xl font-normal not-italic">{word[0]}</span>
                    {word.slice(1)}...
                  </p>
                );
              })}
            </div>

            {/* Quote */}
            <blockquote className="relative pl-4 border-l-2 border-secondary/60 mb-8">
              <p className="font-serif text-base md:text-lg italic text-muted-foreground leading-relaxed">
                {t(
                  '"Quando o corpo relaxa e harmoniza, o Ser cria condições para regressar à sua mais genuína Expressão."',
                  '"When the body relaxes and harmonizes, the Being creates conditions to return to its most genuine Expression."'
                )}
              </p>
              <footer className="mt-3 text-sm font-medium text-primary tracking-wide">— Daniela Alves</footer>
            </blockquote>

            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-8 gap-2"
              onClick={() => document.querySelector('#servicos')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {t('Descobrir Terapias', 'Discover Therapies')}
              <ArrowDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
