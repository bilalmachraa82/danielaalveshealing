import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Flower2, Sun, Leaf, MessageCircle } from 'lucide-react';

const WA_BASE = 'https://wa.me/351914173445?text=';

const Services = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [openModal, setOpenModal] = useState<number | null>(null);

  const services = [
    {
      icon: Flower2,
      title: t('Sessões Healing & Wellness', 'Healing & Wellness Sessions'),
      desc: t(
        'Sessão terapêutica personalizada para um equilíbrio e bem estar profundos.',
        'Personalized therapeutic session for deep balance and well-being.'
      ),
      quote: t(
        '"O corpo sabe como voltar ao equilíbrio — às vezes só precisa de ajuda para libertar o que ficou preso."',
        '"The body knows how to return to balance — sometimes it just needs help releasing what got stuck."'
      ),
      modal: {
        text: t(
          'Uma viagem única, guiada por 15 anos de experiência e pela intuição, oferecendo um espaço seguro de cura e transformação. Após um diagnóstico inicial, verificamos qual a melhor abordagem tendo em vista as necessidades e objectivos, podendo usar várias técnicas de massagem, drenagem linfática manual, aromaterapia, terapia de som, técnicas energéticas ou de libertação emocional.',
          'A unique journey, guided by 15 years of experience and intuition, offering a safe space for healing and transformation. After an initial assessment, we determine the best approach based on your needs and goals, using various massage techniques, manual lymphatic drainage, aromatherapy, sound therapy, energy techniques or emotional release.'
        ),
        duration: t('Duração: ~2h', 'Duration: ~2h'),
        price: t('Preço: 122€', 'Price: 122€'),
      },
      wa: encodeURIComponent(t('Olá Daniela, gostaria de agendar uma Sessão Healing & Wellness.', 'Hello Daniela, I would like to book a Healing & Wellness Session.')),
    },
    {
      icon: Sun,
      title: t('Imersão Pura Radiância', 'Pure Radiance Immersion'),
      desc: t(
        'Uma experiência exclusiva de pura nutrição e cuidado, com mais tempo para Recuperar, Reenergizar e Relaxar.',
        'An exclusive experience of pure nourishment and care, with more time to Recover, Re-energize and Relax.'
      ),
      quote: t('"Um momento de Reconexão."', '"A moment of Reconnection."'),
      modal: {
        text: t(
          'Uma imersão profunda que combina massagem, terapia de som, aromaterapia e rituais xamânicos para uma experiência transformadora completa. Mais tempo dedicado a cada fase do tratamento para resultados mais profundos.',
          'A deep immersion combining massage, sound therapy, aromatherapy and shamanic rituals for a complete transformative experience. More time dedicated to each phase for deeper results.'
        ),
        duration: t('Duração: +3h', 'Duration: +3h'),
        price: '',
      },
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre a Imersão Pura Radiância.', 'Hello Daniela, I would like to know more about the Pure Radiance Immersion.')),
    },
    {
      icon: Leaf,
      title: 'Pure Earth Love',
      desc: t(
        'Produtos de Aromaterapia exclusivos e personalizados.',
        'Exclusive and personalized Aromatherapy products.'
      ),
      quote: t(
        '"Para adquirir o seu agende uma sessão para delinearmos o seu perfil e necessidades."',
        '"To acquire yours, schedule a session so we can outline your profile and needs."'
      ),
      modal: {
        text: t(
          'Aromaterapia personalizada com óleos essenciais 100% naturais. Requer uma consulta inicial para criar o seu perfil aromático e identificar as suas necessidades específicas.',
          'Personalized aromatherapy with 100% natural essential oils. Requires an initial consultation to create your aromatic profile and identify your specific needs.'
        ),
        duration: '',
        price: '',
      },
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre os produtos Pure Earth Love.', 'Hello Daniela, I would like to know more about Pure Earth Love products.')),
    },
  ];

  return (
    <section id="servicos" className="py-24 lg:py-36 bg-background">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        {/* Section header */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Terapias', 'Therapies')}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-6 text-balance">
            {t('Cuidar de Ti', 'Caring for You')}
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed text-pretty">
            {t('Sessões para uma Harmonia profunda do Ser, de Corpo e Alma!', 'Sessions for a deep Harmony of Being, Body and Soul!')}
          </p>
        </div>

        {/* Editorial asymmetric grid */}
        <div className="grid md:grid-cols-3 gap-6 lg:gap-10">
          {services.map((s, i) => (
            <Card
              key={i}
              className={`group relative overflow-hidden bg-card hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 border-0 shadow-lg ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
              }`}
              style={{
                transitionDelay: isVisible ? `${i * 150}ms` : '0ms',
                marginTop: i === 1 ? '2rem' : '0',
              }}
            >
              {/* Gold accent line */}
              <div className="h-px w-full bg-gradient-to-r from-transparent via-gold to-transparent" />

              <CardContent className="p-10 lg:p-12 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 rounded-full border border-gold/30 flex items-center justify-center mb-8 group-hover:border-gold/60 transition-colors duration-500">
                  <s.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-light text-foreground mb-5 tracking-wider">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-grow text-pretty">{s.desc}</p>
                <p className="font-serif italic text-sm text-primary/60 mb-8 leading-relaxed">{s.quote}</p>
                <Button
                  variant="ghost"
                  className="rounded-full text-xs tracking-[0.15em] uppercase text-foreground/60 hover:text-foreground hover:bg-muted transition-all"
                  onClick={() => setOpenModal(i)}
                >
                  {t('Saber mais', 'Learn more')} →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      {services.map((s, i) => (
        <Dialog key={i} open={openModal === i} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-lg border-0 shadow-2xl">
            {/* Gold left accent */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold/50 to-transparent rounded-l-lg" />

            <DialogHeader className="pl-4">
              <p className="text-[10px] tracking-[0.3em] uppercase text-gold mb-2">{t('Terapia', 'Therapy')}</p>
              <DialogTitle className="font-serif text-2xl md:text-3xl font-extralight text-foreground tracking-wider">{s.title}</DialogTitle>
              <DialogDescription className="sr-only">{s.title}</DialogDescription>
            </DialogHeader>
            <div className="pl-4">
              <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{s.modal.text}</p>
              {(s.modal.duration || s.modal.price) && (
                <div className="flex gap-6 text-sm mt-4 pt-4 border-t border-border/50">
                  {s.modal.duration && <span className="text-foreground/80 tracking-wide">{s.modal.duration}</span>}
                  {s.modal.price && <span className="text-gold font-medium tracking-wide">{s.modal.price}</span>}
                </div>
              )}
              <a href={`${WA_BASE}${s.wa}`} target="_blank" rel="noopener noreferrer" className="mt-6 block">
                <Button className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2 rounded-full text-xs tracking-wider">
                  <MessageCircle className="h-4 w-4" />
                  {t('Agendar via WhatsApp', 'Book via WhatsApp')}
                </Button>
              </a>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </section>
  );
};

export default Services;
