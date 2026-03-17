import { useState, useCallback } from 'react';
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

  const prev = useCallback(() => setCurrent(c => (c === 0 ? testimonials.length - 1 : c - 1)), []);
  const next = useCallback(() => setCurrent(c => (c === testimonials.length - 1 ? 0 : c + 1)), []);

  const item = testimonials[current];
  const initials = item.name.split(' ').map(n => n[0]).join('');

  return (
    <section id="testemunhos" className="py-20 lg:py-28 bg-mist">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-primary tracking-wider">
            {t('Testemunhos', 'Testimonials')}
          </h2>
        </div>

        <div className={`max-w-2xl mx-auto transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <Card className="glass-card overflow-hidden">
            <CardContent className="p-8 md:p-10 text-center">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4 font-serif text-lg">
                {initials}
              </div>
              <h4 className="font-medium text-foreground">{item.name}</h4>
              <p className="text-xs text-muted-foreground mb-3">{item.loc}</p>
              <div className="flex justify-center mb-4 text-secondary">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-4 w-4 fill-current" />)}
              </div>
              <span className="inline-block text-[10px] tracking-wider uppercase bg-muted px-2 py-0.5 rounded mb-4 text-muted-foreground">Google</span>
              <p className="font-serif italic text-foreground/80 leading-relaxed">
                "{lang === 'pt' ? item.text.pt : item.text.en}"
              </p>
            </CardContent>
          </Card>

          {/* Controls */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button variant="ghost" size="icon" onClick={prev} className="rounded-full" aria-label="Previous">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex gap-1.5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary w-6' : 'bg-border'}`}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>
            <Button variant="ghost" size="icon" onClick={next} className="rounded-full" aria-label="Next">
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Google badge */}
          <div className="text-center mt-8">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <span className="font-medium">5.0</span>
              <div className="flex text-secondary">
                {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 fill-current" />)}
              </div>
              <span>23 {t('avaliações no Google', 'reviews on Google')}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
