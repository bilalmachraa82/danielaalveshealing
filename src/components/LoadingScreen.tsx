import { useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from '@/lib/config/therapist';

const LoadingScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 600);
    const removeTimer = setTimeout(() => setVisible(false), 1000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-800 ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(300 20% 14%) 0%, hsl(295 22% 11%) 50%, hsl(290 25% 9%) 100%)',
      }}
    >
      {/* Logo text */}
      <h1
        className={`font-serif text-4xl md:text-5xl font-extralight tracking-[0.2em] text-white/90 mb-3 transition-all duration-1000 ${
          fadeOut ? 'translate-y-[-10px]' : 'translate-y-0'
        }`}
        style={{
          animation: 'loading-reveal 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) forwards',
        }}
      >
        {DEFAULT_CONFIG.name}
      </h1>
      <p
        className="text-[9px] tracking-[0.4em] uppercase text-gold/70 mb-10"
        style={{
          animation: 'loading-reveal 1.2s cubic-bezier(0.25, 0.8, 0.25, 1) 0.3s forwards',
          opacity: 0,
        }}
      >
        {DEFAULT_CONFIG.tagline}
      </p>

      {/* Gold line expanding */}
      <div
        className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent"
        style={{
          animation: 'loading-line 1.5s cubic-bezier(0.25, 0.8, 0.25, 1) 0.5s forwards',
          width: 0,
        }}
      />
    </div>
  );
};

export default LoadingScreen;
