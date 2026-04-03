import { useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from '@/lib/config/therapist';

const LoadingScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [stage, setStage] = useState(0); // 0=hidden, 1=logo, 2=tagline, 3=line

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 100);   // logo appears
    const t2 = setTimeout(() => setStage(2), 800);   // tagline appears
    const t3 = setTimeout(() => setStage(3), 1300);  // gold line expands
    const t4 = setTimeout(() => setFadeOut(true), 2200);
    const t5 = setTimeout(() => setVisible(false), 2800);
    return () => { [t1, t2, t3, t4, t5].forEach(clearTimeout); };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center transition-opacity duration-[600ms] ${
        fadeOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'linear-gradient(180deg, hsl(300 20% 14%) 0%, hsl(295 22% 11%) 50%, hsl(290 25% 9%) 100%)',
      }}
    >
      {/* Subtle radial glow behind logo */}
      <div
        className="absolute rounded-full transition-all duration-[1500ms] ease-out"
        style={{
          width: stage >= 1 ? 400 : 0,
          height: stage >= 1 ? 400 : 0,
          background: 'radial-gradient(circle, hsl(270 28% 50% / 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Logo — larger, scale + fade entrance */}
      <picture>
        <source srcSet="/images/logo.webp" type="image/webp" />
        <img
          src="/images/logo.png"
          alt={DEFAULT_CONFIG.name}
          className="w-auto mb-12 transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            height: stage >= 1 ? undefined : 0,
            opacity: stage >= 1 ? 1 : 0,
            transform: stage >= 1
              ? (fadeOut ? 'scale(1.02) translateY(-8px)' : 'scale(1) translateY(0)')
              : 'scale(0.85) translateY(24px)',
            maxHeight: '6rem',
          }}
        />
      </picture>

      {/* Gold line — expanding with shimmer */}
      <div className="relative">
        <div
          className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{ width: stage >= 3 ? 160 : 0 }}
        />
        {stage >= 3 && (
          <div
            className="absolute inset-0 h-px animate-gold-shimmer"
            style={{
              opacity: 0.4,
              background: 'linear-gradient(90deg, transparent, hsl(38 52% 52% / 0.8), transparent)',
              backgroundSize: '200% 100%',
            }}
          />
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
