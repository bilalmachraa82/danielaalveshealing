import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted;
      setIsMuted(!isMuted);
    }
  };

  const words = [
    { pt: 'Serenar', en: 'Soothe' },
    { pt: 'Equilibrar', en: 'Equilibrate' },
    { pt: 'Relaxar', en: 'Relax' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-overlay">
      {/* Video background */}
      <video
        autoPlay
        muted
        loop
        playsInline
        poster="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/Moi-optimized.jpg"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-foreground/50" />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent" />

      {/* Content */}
      <div ref={ref} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* S.E.R. words — oversized serif */}
        <div className="space-y-1 mb-10">
          {words.map((w, i) => {
            const word = t(w.pt, w.en);
            return (
              <p
                key={i}
                className={`font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-extralight tracking-[0.15em] text-white/90 transition-all duration-1000 ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                }`}
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <span className="text-gold font-light">{word[0]}</span>
                <span className="italic">{word.slice(1)}</span>
                {i < words.length - 1 && <span className="text-gold/40">.</span>}
              </p>
            );
          })}
        </div>

        {/* Decorative gold divider */}
        <div className={`section-divider mb-8 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`} />

        {/* Quote with visible decorative marks */}
        <div className={`relative max-w-xl mx-auto transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="absolute -top-6 -left-4 font-serif text-6xl text-gold/30 select-none leading-none">"</span>
          <p className="font-serif text-sm sm:text-base md:text-lg italic text-white/70 leading-relaxed tracking-wide px-6">
            {t(
              'Quando o corpo relaxa e harmoniza, o Ser cria condições para regressar à sua mais genuína Expressão.',
              'When the body relaxes and harmonizes, the Being creates conditions to return to its most genuine Expression.'
            )}
          </p>
          <span className="absolute -bottom-6 -right-4 font-serif text-6xl text-gold/30 select-none leading-none">"</span>
        </div>
        <p className={`text-xs tracking-[0.3em] uppercase text-gold/80 mt-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          — Daniela Alves
        </p>

        {/* CTA */}
        <div className={`mt-12 transition-all duration-1000 delay-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            size="lg"
            className="bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full px-10 py-6 text-sm tracking-[0.15em] uppercase backdrop-blur-sm transition-all duration-300 hover:scale-105"
            onClick={() => document.querySelector('#servicos')?.scrollIntoView({ behavior: 'smooth' })}
          >
            {t('Descobrir Terapias', 'Discover Therapies')}
          </Button>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-scroll-hint">
        <ChevronDown className="h-6 w-6 text-white/50" />
      </div>
    </section>
  );
};

export default Hero;
