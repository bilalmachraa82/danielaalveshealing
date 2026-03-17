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
    <section id="servicos" className="py-20 lg:py-28 bg-mist">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-primary tracking-wider mb-4">
            {t('Cuidar de Ti', 'Caring for You')}
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            {t('Sessões para uma Harmonia profunda do Ser, de Corpo e Alma!', 'Sessions for a deep Harmony of Being, Body and Soul!')}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {services.map((s, i) => (
            <Card
              key={i}
              className={`group relative overflow-hidden bg-card hover:shadow-xl transition-all duration-500 hover:-translate-y-1 border-border/50 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ transitionDelay: isVisible ? `${i * 100}ms` : '0ms' }}
            >
              <CardContent className="p-8 flex flex-col items-center text-center h-full">
                <div className="w-16 h-16 rounded-full bg-secondary/15 flex items-center justify-center mb-6">
                  <s.icon className="h-7 w-7 text-secondary" />
                </div>
                <h3 className="font-serif text-xl md:text-2xl font-normal text-foreground mb-4 tracking-wide">{s.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4 flex-grow">{s.desc}</p>
                <p className="font-serif italic text-sm text-primary/70 mb-6">{s.quote}</p>
                <Button
                  variant="outline"
                  className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
                  onClick={() => setOpenModal(i)}
                >
                  {t('Saber mais', 'Learn more')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Modals */}
      {services.map((s, i) => (
        <Dialog key={i} open={openModal === i} onOpenChange={() => setOpenModal(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif text-2xl font-light text-primary tracking-wide">{s.title}</DialogTitle>
              <DialogDescription className="sr-only">{s.title}</DialogDescription>
            </DialogHeader>
            <p className="text-muted-foreground text-sm leading-relaxed">{s.modal.text}</p>
            {(s.modal.duration || s.modal.price) && (
              <div className="flex gap-4 text-sm font-medium text-foreground mt-2">
                {s.modal.duration && <span>{s.modal.duration}</span>}
                {s.modal.price && <span>{s.modal.price}</span>}
              </div>
            )}
            <a href={`${WA_BASE}${s.wa}`} target="_blank" rel="noopener noreferrer" className="mt-4 block">
              <Button className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2 rounded-full">
                <MessageCircle className="h-4 w-4" />
                {t('Agendar via WhatsApp', 'Book via WhatsApp')}
              </Button>
            </a>
          </DialogContent>
        </Dialog>
      ))}
    </section>
  );
};

export default Services;
