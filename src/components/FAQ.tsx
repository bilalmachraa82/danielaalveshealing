import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const faqs = [
    {
      q: t('O que esperar na primeira sessão?', 'What to expect in the first session?'),
      a: t(
        'Com base numa leitura inicial, a sessão é ajustada às suas necessidades e ao momento. Numa visão integrativa, podem ser usadas diferentes técnicas: massagem, drenagem linfática manual, aromaterapia, terapia de som, meditação, técnicas energéticas ou de libertação emocional.',
        'Based on an initial reading, the session is adjusted to your needs and moment. In an integrative vision, different techniques may be used: massage, manual lymphatic drainage, aromatherapy, sound therapy, meditation, energy techniques or emotional release.'
      ),
    },
    {
      q: t('Qual a duração de uma sessão?', 'How long is a session?'),
      a: t(
        'As sessões Healing Touch têm a duração aproximada de 2 horas (150€). A Imersão Pura Radiância dura aproximadamente 4 horas (450€). A sessão de aromaterapia Pure Earth Love dura cerca de 30 minutos (80€, inclui o produto personalizado).',
        'Healing Touch sessions last approximately 2 hours (150€). The Pure Radiance Immersion lasts approximately 4 hours (450€). The Pure Earth Love aromatherapy session takes about 30 minutes (80€, includes the personalized product).'
      ),
    },
    {
      q: t('Onde fica o espaço terapêutico?', 'Where is the therapeutic space?'),
      a: t(
        'R. do Regueiro do Tanque 3, Fontanelas, São João das Lampas, 2705-415 Sintra. Estacionamento gratuito disponível.',
        'R. do Regueiro do Tanque 3, Fontanelas, São João das Lampas, 2705-415 Sintra. Free parking available.'
      ),
    },
    {
      q: t('Como posso agendar uma sessão?', 'How can I book a session?'),
      a: t(
        'Pode agendar através do WhatsApp (+351 914 173 445), por telefone ou por email (daniela@danielaalveshealing.com).',
        'You can book via WhatsApp (+351 914 173 445), by phone or by email (daniela@danielaalveshealing.com).'
      ),
    },
    {
      q: t('Existe Cheque-Oferta disponível?', 'Are Gift Vouchers available?'),
      a: t(
        'Sim, o Cheque-Oferta existe em formato físico ou digital. Entre em contacto para adquirir o seu.',
        'Yes, Gift Vouchers are available in physical or digital format. Get in touch to purchase yours.'
      ),
    },
  ];

  return (
    <section className="py-24 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-lilac)) 0%, hsl(var(--section-blush)) 52%, hsl(var(--section-warm-soft)) 100%)' }}>
      {/* Radial gradient accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/[0.02] rounded-full blur-3xl pointer-events-none" />

      {/* Botanical SVG */}
      <svg className="absolute bottom-8 right-0 w-32 h-32 text-gold/[0.04] pointer-events-none" viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.4">
        <path d="M60 10C60 40 40 60 10 60C40 60 60 80 60 110C60 80 80 60 110 60C80 60 60 40 60 10Z" />
        <circle cx="60" cy="60" r="18" />
      </svg>

      <div ref={ref} className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
        <div className={`text-center mb-16 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Dúvidas', 'Questions')}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-6">
            {t('Perguntas Frequentes', 'Frequently Asked Questions')}
          </h2>
          <div className="section-divider" />
        </div>

        <Accordion type="single" collapsible className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`item-${i}`}
              className="border-b-0 mb-3 glass-card rounded-lg shadow-sm overflow-hidden group data-[state=open]:shadow-md transition-all"
            >
              <AccordionTrigger className="font-serif text-base md:text-lg font-light text-foreground hover:text-foreground hover:no-underline px-6 py-5 [&[data-state=open]]:text-primary">
                <div className="flex items-center gap-4 text-left">
                  <span className="w-1 h-6 rounded-full bg-border group-data-[state=open]:bg-gold group-data-[state=open]:h-8 transition-all duration-300 shrink-0" />
                  {faq.q}
                </div>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed px-6 pb-6 pl-11 text-pretty">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQ;
