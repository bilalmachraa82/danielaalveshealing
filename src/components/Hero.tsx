import { useState, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { ChevronDown, Volume2, VolumeX } from 'lucide-react';

const Hero = () => {
  const { t } = useLanguage();
  const config = useTherapist();
  const { ref, isVisible } = useScrollAnimation(0.05);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
    // Mobile browsers require play() from user gesture to unlock audio
    if (!video.muted) {
      video.play().catch(() => {});
    }
  };

  const words = [
    { pt: 'Serenar', en: 'Soothe' },
    { pt: 'Equilibrar', en: 'Balance' },
    { pt: 'Relaxar', en: 'Relax' },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden noise-overlay">
      {/* Video background */}
      <video
        ref={videoRef}
        autoPlay
        muted
        loop
        playsInline
        poster="/images/moi.webp"
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source src="/images/hero-video.mp4" type="video/mp4" />
      </video>

      {/* Mute/Unmute toggle */}
      <button
        onClick={toggleMute}
        className="absolute top-24 right-6 z-20 w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all duration-300"
        aria-label={isMuted ? 'Unmute video' : 'Mute video'}
      >
        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
      </button>

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-foreground/50" />

      {/* Gradient fade at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#3B2635] to-transparent" />

      {/* Content */}
      <div ref={ref} className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        {/* S.E.R. words — oversized serif */}
        <div className="space-y-1 mb-10">
          {words.map((w, i) => {
            const word = t(w.pt, w.en);
            return (
              <p
                key={i}
                className={`font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-light tracking-[0.15em] text-white/90 transition-all duration-1000 ${
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
            {t(config.quotes.main.pt, config.quotes.main.en)}
          </p>
          <span className="absolute -bottom-6 -right-4 font-serif text-6xl text-gold/30 select-none leading-none">"</span>
        </div>
        <p className={`text-xs tracking-[0.3em] uppercase text-gold/80 mt-6 transition-all duration-1000 delay-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          — {config.quotes.author}
        </p>

        {/* CTA */}
        <div className={`mt-12 transition-all duration-1000 delay-[900ms] ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <Button
            size="lg"
            className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-foreground rounded-full px-10 py-6 text-sm tracking-[0.12em] uppercase font-medium transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--gold)/0.3)] hover:scale-105"
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
