import { useState, useCallback, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

const Testimonials = () => {
  const { lang, t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [current, setCurrent] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const prev = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrent(c => (c === 0 ? testimonials.length - 1 : c - 1));
  }, []);
  const next = useCallback(() => {
    setIsAutoPlaying(false);
    setCurrent(c => (c === testimonials.length - 1 ? 0 : c + 1));
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;
    const timer = setInterval(() => {
      setCurrent(c => (c === testimonials.length - 1 ? 0 : c + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  const item = testimonials[current];
  const initials = item.name.split(' ').map(n => n[0]).join('');

  return (
    <section id="testemunhos" className="py-24 lg:py-36 bg-gradient-to-b from-primary/[0.12] via-primary/[0.18] to-primary/[0.10] relative overflow-hidden noise-overlay">
      {/* Decorative large quote */}
      <span className="absolute top-12 left-1/2 -translate-x-1/2 font-serif text-[20rem] leading-none text-primary/[0.06] select-none pointer-events-none">"</span>

      {/* Radial glow accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/[0.05] rounded-full blur-3xl pointer-events-none" />

      {/* Floating gold accents */}
      <div className="absolute top-1/4 right-16 w-2 h-2 rounded-full bg-gold/20 animate-float-gentle" />
      <div className="absolute bottom-1/3 left-12 w-1.5 h-1.5 rounded-full bg-gold/15 animate-float-gentle" style={{ animationDelay: '1.5s' }} />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Testemunhos', 'Testimonials')}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-6">
            {t('Palavras que Aquecem', 'Words that Warm')}
          </h2>
          <div className="section-divider" />
        </div>

        <div className={`max-w-2xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="border border-gold/20 shadow-2xl bg-card overflow-hidden">
            <CardContent className="p-10 md:p-14 text-center relative">
              {/* Gold top line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />

              {/* Avatar with gold ring */}
              <div className="w-16 h-16 rounded-full border-2 border-gold/40 flex items-center justify-center mx-auto mb-5 bg-gradient-to-br from-mist to-cream shadow-inner">
                <span className="font-serif text-lg text-primary">{initials}</span>
              </div>
              <h4 className="font-serif text-lg font-light text-foreground tracking-wider">{item.name}</h4>
              <p className="text-[11px] tracking-[0.2em] uppercase text-muted-foreground mb-4">{item.loc}</p>
              <div className="flex justify-center mb-6 text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-current" />)}
              </div>
              <p className="font-serif italic text-foreground leading-relaxed text-lg md:text-xl">
                "{lang === 'pt' ? item.text.pt : item.text.en}"
              </p>

              <span className="inline-block text-[9px] tracking-[0.2em] uppercase text-muted-foreground mt-6 border border-border px-3 py-1 rounded-full">
                Google Review
              </span>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6 mt-8">
            <Button variant="ghost" size="icon" onClick={prev} className="rounded-full w-10 h-10 text-foreground/40 hover:text-foreground" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => { setIsAutoPlaying(false); setCurrent(i); }}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === current ? 'bg-gold w-8' : 'bg-border w-1.5'}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={next} className="rounded-full w-10 h-10 text-foreground/40 hover:text-foreground" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Google badge */}
          <div className="text-center mt-10">
            <div className="inline-flex items-center gap-2 text-xs text-muted-foreground/60">
              <span className="font-medium">5.0</span>
              <div className="flex text-gold">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-2.5 w-2.5 fill-current" />)}
              </div>
              <span className="tracking-wide">23 {t('avaliações no Google', 'reviews on Google')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
