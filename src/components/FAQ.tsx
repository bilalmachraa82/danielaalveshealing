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
        'Após um diagnóstico inicial, verificamos qual a melhor abordagem tendo em vista as suas necessidades e objectivos, podendo incluir técnicas de massagem, terapia de som, kinesiologia e aromaterapia.',
        'After an initial assessment, we determine the best approach based on your needs and goals, which may include massage techniques, sound therapy, kinesiology and aromatherapy.'
      ),
    },
    {
      q: t('Qual a duração de uma sessão?', 'How long is a session?'),
      a: t(
        'As sessões Healing & Wellness têm a duração aproximada de 2 horas. A experiência Pura Radiância tem uma duração superior.',
        'Healing & Wellness sessions last approximately 2 hours. The Pure Radiance experience lasts longer.'
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
    <section className="py-20 lg:py-28 bg-subtle">
      <div ref={ref} className="container mx-auto px-4 lg:px-8 max-w-3xl">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-primary tracking-wider">
            {t('Perguntas Frequentes', 'Frequently Asked Questions')}
          </h2>
        </div>

        <Accordion type="single" collapsible className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="border-border/50">
              <AccordionTrigger className="font-serif text-lg font-normal text-foreground hover:text-primary hover:no-underline py-5">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
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
