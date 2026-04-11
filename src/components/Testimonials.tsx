import { useRef, useState, useEffect, useCallback } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';

const testimonials = [
  { name: 'Luke Kohen', loc: 'London, UK', text: { pt: 'Daniela é uma terapeuta muito talentosa com um toque de cura único e profundidade de presença.', en: 'Daniela is a very talented therapist with a unique healing touch and depth of presence.' } },
  { name: 'Mandy Fransz', loc: 'Amsterdam, Netherlands', text: { pt: 'Daniela é realmente incrível. A sua abordagem intuitiva ajudou-me a liberar tensões e encontrar equilíbrio.', en: 'Daniela is truly amazing. Her intuitive approach helped me release tensions and find balance.' } },
  { name: 'Jesse Cannone', loc: 'New York, USA', text: { pt: 'Daniela é uma terapeuta incrível que me ajudou a limpar bloqueios e curar coisas que eu estava tentando curar por muitos, muitos anos.', en: 'Daniela is an incredible therapist who helped me clear blockages and heal things I had been trying to heal for many, many years.' } },
  { name: 'RatnaDewi Jewel', loc: 'Bali, Indonesia', text: { pt: 'Daniela é uma terapeuta maravilhosa com um dom natural para cura e uma presença muito reconfortante.', en: 'Daniela is a wonderful therapist with a natural gift for healing and a very comforting presence.' } },
  { name: 'Indigo Sea', loc: 'Byron Bay, Australia', text: { pt: 'Tive uma experiência transformadora com a Daniela. A sua abordagem holística e intuição aguçada são extraordinárias.', en: 'I had a transformative experience with Daniela. Her holistic approach and sharp intuition are extraordinary.' } },
  { name: 'Karina Rosatella', loc: 'Rome, Italy', text: { pt: 'A Daniela tem um dom especial para cura. As suas sessões são profundamente transformadoras.', en: 'Daniela has a special gift for healing. Her sessions are deeply transformative.' } },
  { name: 'Sofia Marques', loc: 'Lisbon, Portugal', text: { pt: 'As sessões com a Daniela são verdadeiramente únicas. Tem uma sensibilidade incrível.', en: 'Sessions with Daniela are truly unique. She has an incredible sensitivity.' } },
];

const TestimonialCard = ({ item, lang }: { item: typeof testimonials[0]; lang: string }) => {
  const initials = item.name.split(' ').map(n => n[0]).join('');
  return (
    <div className="flex-none w-[85vw] sm:w-[380px] snap-center">
      <div className="h-full border border-gold/15 rounded-xl bg-card shadow-lg p-6 sm:p-8 relative overflow-hidden">
        {/* Gold top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold/60 to-transparent" />

        {/* Quote mark */}
        <span className="absolute top-4 right-5 font-serif text-5xl text-gold/10 select-none leading-none">"</span>

        {/* Avatar + name */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-11 h-11 rounded-full border border-gold/30 flex items-center justify-center bg-gradient-to-br from-mist to-cream shrink-0">
            <span className="font-serif text-sm text-primary">{initials}</span>
          </div>
          <div>
            <h4 className="font-serif text-sm font-light text-foreground tracking-wider leading-tight">{item.name}</h4>
            <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground">{item.loc}</p>
          </div>
        </div>

        {/* Stars */}
        <div className="flex mb-4 text-gold">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
        </div>

        {/* Quote text */}
        <p className="font-serif italic text-foreground/80 leading-relaxed text-[0.95rem] tracking-wide">
          "{lang === 'pt' ? item.text.pt : item.text.en}"
        </p>

        {/* Google badge */}
        <span className="inline-block text-[8px] tracking-[0.15em] uppercase text-muted-foreground/60 mt-5 border border-border/60 px-2.5 py-0.5 rounded-full">
          Google Review
        </span>
      </div>
    </div>
  );
};

const Testimonials = () => {
  const { lang, t } = useLanguage();
  const config = useTherapist();
  const { ref, isVisible } = useScrollAnimation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', updateScrollState, { passive: true });
    updateScrollState();
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [updateScrollState]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const cardWidth = 396; // card width + gap
    el.scrollBy({ left: direction === 'left' ? -cardWidth : cardWidth, behavior: 'smooth' });
  };

  return (
    <section id="testemunhos" className="py-24 lg:py-36 relative overflow-hidden noise-overlay" style={{ background: 'radial-gradient(circle at 50% 50%, hsl(var(--primary) / 0.22) 0%, transparent 40%), linear-gradient(180deg, hsl(var(--section-lilac-strong)) 0%, hsl(var(--primary) / 0.14) 55%, hsl(var(--section-lilac)) 100%)' }}>
      {/* Decorative large quote */}
      <span className="absolute top-8 left-1/2 -translate-x-1/2 font-serif text-[22rem] leading-none text-primary/[0.08] select-none pointer-events-none">"</span>

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.05] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/4 right-16 w-2 h-2 rounded-full bg-gold/20 animate-float-gentle" />
      <div className="absolute bottom-1/3 left-12 w-1.5 h-1.5 rounded-full bg-gold/15 animate-float-gentle" style={{ animationDelay: '1.5s' }} />

      <div ref={ref} className="relative z-10">
        <div className={`text-center mb-14 px-4 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Testemunhos', 'Testimonials')}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-light text-foreground tracking-wider mb-6">
            {t('Palavras que Tocam', 'Words that Touch')}
          </h2>
          <div className="section-divider" />
        </div>

        {/* Carousel area */}
        <div className={`relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Scroll container */}
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth px-4 lg:px-[calc(50vw-400px)] pb-4 no-scrollbar"
            style={{ scrollbarWidth: 'none' }}
          >
            {testimonials.map((item, i) => (
              <TestimonialCard key={i} item={item} lang={lang} />
            ))}
          </div>

          {/* Navigation arrows */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="w-10 h-10 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/30 hover:bg-background/50 transition-all disabled:opacity-30 disabled:cursor-default"
              aria-label="Previous"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="w-10 h-10 rounded-full border border-foreground/15 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/30 hover:bg-background/50 transition-all disabled:opacity-30 disabled:cursor-default"
              aria-label="Next"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Google Reviews badge — links to real Google page */}
        <div className="text-center mt-10">
          <a
            href={config.socialLinks.googleReview}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2.5 text-sm text-foreground bg-background/80 backdrop-blur-sm px-6 py-3 rounded-full border border-gold/25 shadow-md hover:border-gold/40 hover:shadow-lg transition-all"
          >
            <span className="font-serif font-medium text-gold text-base">5.0</span>
            <div className="flex text-gold">
              {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
            </div>
            <span className="tracking-wide font-medium text-foreground/80">
              23 {t('avaliações no Google', 'reviews on Google')} →
            </span>
          </a>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
