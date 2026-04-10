import { useState, useEffect } from 'react';
import { DEFAULT_CONFIG } from '@/lib/config/therapist';

/**
 * Premium loading screen with 5-stage staggered reveal:
 * 0 → ambient glow    (200ms)
 * 1 → logo icon       (500ms)  — scale + fade from below
 * 2 → brand name      (900ms)  — letter-spacing reveal
 * 3 → gold divider    (1300ms) — expand from center
 * 4 → tagline         (1700ms) — fade up with tracking
 * exit → fade + lift  (2600ms → 3200ms)
 */
const LoadingScreen = () => {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(1), 200),
      setTimeout(() => setStage(2), 600),
      setTimeout(() => setStage(3), 1100),
      setTimeout(() => setStage(4), 1500),
      setTimeout(() => setFadeOut(true), 2600),
      setTimeout(() => setVisible(false), 3200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  if (!visible) return null;

  const ease = 'cubic-bezier(0.16, 1, 0.3, 1)';

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-[600ms] ${
        fadeOut ? 'opacity-0 scale-[1.02]' : 'opacity-100 scale-100'
      }`}
      style={{
        background: 'linear-gradient(160deg, #3B2635 0%, #2E1D28 40%, #231620 100%)',
        transitionTimingFunction: ease,
      }}
    >
      {/* Ambient radial glow — appears first */}
      <div
        className="absolute transition-all duration-[2000ms]"
        style={{
          width: stage >= 1 ? 500 : 0,
          height: stage >= 1 ? 500 : 0,
          background: 'radial-gradient(circle, rgba(180, 141, 83, 0.08) 0%, rgba(150, 86, 138, 0.06) 40%, transparent 70%)',
          filter: 'blur(80px)',
          transitionTimingFunction: ease,
        }}
      />

      {/* Secondary ambient — softer, offset */}
      <div
        className="absolute transition-all duration-[2500ms]"
        style={{
          width: stage >= 2 ? 300 : 0,
          height: stage >= 2 ? 300 : 0,
          transform: 'translate(60px, -40px)',
          background: 'radial-gradient(circle, rgba(150, 86, 138, 0.1) 0%, transparent 70%)',
          filter: 'blur(60px)',
          transitionTimingFunction: ease,
        }}
      />

      {/* Content column */}
      <div className="relative flex flex-col items-center">
        {/* Logo image — icon + name */}
        <picture>
          <source srcSet="/images/logo.webp" type="image/webp" />
          <img
            src="/images/logo.png"
            alt={DEFAULT_CONFIG.name}
            loading="eager"
            className="w-auto select-none"
            style={{
              height: stage >= 1 ? '8rem' : '0',
              opacity: stage >= 1 ? 1 : 0,
              transform: stage >= 1
                ? (fadeOut ? 'translateY(-6px) scale(1.01)' : 'translateY(0) scale(1)')
                : 'translateY(20px) scale(0.92)',
              transition: `all 1200ms ${ease}`,
              imageRendering: '-webkit-optimize-contrast' as React.CSSProperties['imageRendering'],
            }}
          />
        </picture>

        {/* Gold divider line with shimmer */}
        <div className="relative mt-5 mb-4">
          <div
            className="h-[0.5px]"
            style={{
              width: stage >= 3 ? 80 : 0,
              background: 'linear-gradient(90deg, transparent, rgba(205, 174, 124, 0.7), transparent)',
              transition: `width 1000ms ${ease}`,
            }}
          />
          {stage >= 3 && (
            <div
              className="absolute inset-0 h-[0.5px]"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(205, 174, 124, 0.9), transparent)',
                backgroundSize: '200% 100%',
                animation: 'gold-shimmer 2.5s ease-in-out infinite',
                opacity: 0.5,
              }}
            />
          )}
        </div>

        {/* Tagline — "Beyond the Body" */}
        <span
          className="select-none"
          style={{
            fontFamily: '"Cormorant Garamond", serif',
            fontSize: '0.85rem',
            fontWeight: 300,
            fontStyle: 'italic',
            letterSpacing: stage >= 4 ? '0.35em' : '0.15em',
            color: 'rgba(205, 174, 124, 0.65)',
            textTransform: 'lowercase',
            opacity: stage >= 4 ? 1 : 0,
            transform: stage >= 4
              ? (fadeOut ? 'translateY(-3px)' : 'translateY(0)')
              : 'translateY(8px)',
            transition: `all 1000ms ${ease}`,
          }}
        >
          {DEFAULT_CONFIG.tagline}
        </span>
      </div>

      {/* Minimal progress — thin gold line at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] overflow-hidden">
        <div
          style={{
            height: '100%',
            width: stage >= 1 ? '100%' : '0%',
            background: 'linear-gradient(90deg, transparent, rgba(205, 174, 124, 0.2), transparent)',
            transition: `width 2400ms ${ease}`,
          }}
        />
      </div>
    </div>
  );
};

export default LoadingScreen;
