import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Home, MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/351914173445?text=' + encodeURIComponent('Olá Daniela, gostaria de saber mais sobre o serviço Home Harmony.');

const SpaceHarmony = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [open, setOpen] = useState(false);

  return (
    <section id="espaco" className="py-24 lg:py-36 relative overflow-hidden">
      {/* Immersive background image with overlay */}
      <div className="absolute inset-0" style={{
        backgroundImage: `url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80")`,
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
            <p className="font-serif italic text-sm text-gold/60 mb-8">
              {t('"Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!"', '"May your Home be a true Haven that amplifies your Inner Harmony!"')}
            </p>
            <Button
              variant="ghost"
              className="rounded-full text-xs tracking-[0.15em] uppercase text-white/60 hover:text-white hover:bg-white/10"
              onClick={() => setOpen(true)}
            >
              {t('Saber mais', 'Learn more')} →
            </Button>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg border-0 shadow-2xl max-h-[90vh] overflow-hidden flex flex-col" style={{ background: 'linear-gradient(170deg, hsl(var(--background)) 0%, hsl(var(--cream)) 40%, hsl(var(--mist)) 100%)' }}>
          {/* Top gold accent line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent" />
          {/* Left gold bar with glow */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-gradient-to-b from-gold via-gold/40 to-transparent rounded-l-lg shadow-[2px_0_12px_hsl(var(--gold)/0.15)]" />
          {/* Decorative quote */}
          <span className="absolute top-4 right-6 font-serif text-7xl text-gold/[0.06] select-none pointer-events-none leading-none">"</span>
          <DialogHeader className="pl-5">
            <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">{t('Espaço', 'Space')}</p>
            <DialogTitle className="font-serif text-2xl md:text-3xl font-extralight text-foreground tracking-wider">Home Harmony</DialogTitle>
            <DialogDescription className="sr-only">Home Harmony</DialogDescription>
          </DialogHeader>
          <div className="pl-5 overflow-y-auto flex-1 min-h-0">
            <div className="text-muted-foreground text-sm leading-relaxed text-pretty space-y-3">
              <p>{t(
                'Se o corpo é o Templo onde habitamos, a casa é o espaço que nos acolhe e sustenta no dia-a-dia e um dos locais onde passamos mais tempo, influenciando-nos de forma directa e indirecta.',
                'If the body is the Temple where we dwell, the home is the space that welcomes and sustains us daily and one of the places where we spend the most time, influencing us directly and indirectly.'
              )}</p>
              <p>{t(
                'Idealmente é um local que nos nutre e acolhe, um local seguro, confortável, prático e bonito de acordo com os nossos gostos e necessidades.',
                'Ideally it is a place that nourishes and welcomes us, a safe, comfortable, practical and beautiful place according to our tastes and needs.'
              )}</p>
              <p>{t(
                'O Home Harmony é um serviço de organização holística que apoia a transformação do seu espaço de forma consciente, prática e alinhada consigo.',
                'Home Harmony is a holistic organization service that supports the transformation of your space in a conscious, practical and aligned way.'
              )}</p>
              <p>{t(
                'Mais do que organizar, este trabalho propõe uma abordagem integrada entre pessoa e espaço — onde não só se cria ordem e funcionalidade, mas também uma relação mais harmoniosa com a casa.',
                'More than organizing, this work proposes an integrated approach between person and space — where not only order and functionality are created, but also a more harmonious relationship with the home.'
              )}</p>
              <p>{t(
                'Com base numa leitura do momento e das suas necessidades, vamos ajustando o espaço de forma intuitiva e personalizada, respeitando o seu ritmo, os seus gostos e a realidade do seu dia-a-dia.',
                'Based on a reading of the moment and your needs, we adjust the space intuitively and personally, respecting your rhythm, your tastes and the reality of your daily life.'
              )}</p>
              <p>{t(
                'Sem rigidez ou perfeccionismo — não se trata de criar uma casa "perfeita", mas um espaço vivo, acolhedor e funcional, que o(a) apoie e reflita.',
                'Without rigidity or perfectionism — it is not about creating a "perfect" home, but a living, welcoming and functional space that supports and reflects you.'
              )}</p>
              <p>{t(
                'Este processo decorre geralmente ao longo de várias visitas, permitindo uma transformação progressiva, sustentável e integrada, com atenção ao uso de materiais e soluções mais naturais e saudáveis.',
                'This process generally takes place over several visits, allowing for a progressive, sustainable and integrated transformation, with attention to the use of more natural and healthy materials and solutions.'
              )}</p>
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm mt-5 pt-4 border-t border-gold/10">
              <span className="text-foreground/70 tracking-wide font-light">{t('Duração: a combinar', 'Duration: to be arranged')}</span>
              <span className="font-serif text-lg text-gold tracking-wide">{t('Preço: por consulta', 'Price: by consultation')}</span>
            </div>
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="mt-6 mb-2 block">
              <Button className="w-full bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                <MessageCircle className="h-4 w-4" />
                {t('Contactar via WhatsApp', 'Contact via WhatsApp')}
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SpaceHarmony;
