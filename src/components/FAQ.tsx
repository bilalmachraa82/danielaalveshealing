import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useTherapist } from '@/lib/config/therapist-context';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const config = useTherapist();

  const faqs = [
    {
      q: t('O que esperar na primeira sessão?', 'What to expect in the first session?'),
      a: t(
        'Com base numa leitura inicial, a sessão é ajustada às suas necessidades e ao momento. Numa visão integrativa, podem ser usadas diferentes técnicas: massagem, drenagem linfática manual, aromaterapia, terapia de som, meditação, técnicas energéticas ou de libertação emocional.',
        'Based on an initial reading, the session is adjusted to your needs and moment. In an integrative vision, different techniques may be used: massage, manual lymphatic drainage, aromatherapy, sound therapy, meditation, energy techniques or emotional release.'
      ),
    },
    {
      q: t('Quanto custa uma massagem terapêutica em Sintra?', 'How much does a therapeutic massage cost in Sintra?'),
      a: t(
        'A Sessão Healing Touch custa 150€ e dura aproximadamente 2 horas. A Imersão Pura Radiância custa 450€ e dura aproximadamente 4 horas. A sessão de aromaterapia Pure Earth Love custa 80€, dura cerca de 30 minutos e inclui o produto personalizado.',
        'The Healing Touch Session costs 150€ and lasts approximately 2 hours. The Pure Radiance Immersion costs 450€ and lasts approximately 4 hours. The Pure Earth Love aromatherapy session costs 80€, takes about 30 minutes and includes the personalized product.'
      ),
    },
    {
      q: t('Qual a duração de uma sessão?', 'How long is a session?'),
      a: t(
        'A duração varia conforme o tipo de sessão. A Sessão Healing Touch dura aproximadamente 2 horas, permitindo um trabalho profundo e integrado. A Imersão Pura Radiância é um mini-retiro de aproximadamente 4 horas, ideal para quem procura uma experiência mais imersiva. A sessão Pure Earth Love de aromaterapia personalizada dura cerca de 30 minutos.',
        'Duration varies by session type. The Healing Touch Session lasts approximately 2 hours, allowing for deep, integrated work. The Pure Radiance Immersion is a mini-retreat of approximately 4 hours, ideal for those seeking a more immersive experience. The Pure Earth Love personalized aromatherapy session takes about 30 minutes.'
      ),
    },
    {
      q: t('Quais as técnicas usadas na terapia holística?', 'What techniques are used in holistic therapy?'),
      a: t(
        'Numa abordagem integrativa, as sessões podem incluir massagem terapêutica, drenagem linfática manual, aromaterapia com óleos essenciais 100% naturais, terapia de som, meditação guiada, técnicas energéticas e técnicas de libertação emocional. Cada sessão é personalizada — as técnicas são escolhidas com base numa leitura inicial das necessidades de cada pessoa.',
        'In an integrative approach, sessions may include therapeutic massage, manual lymphatic drainage, aromatherapy with 100% natural essential oils, sound therapy, guided meditation, energy techniques and emotional release techniques. Each session is personalized — techniques are chosen based on an initial reading of each person\'s needs.'
      ),
    },
    {
      q: t('Onde fica o espaço terapêutico?', 'Where is the therapeutic space?'),
      a: t(
        `O espaço terapêutico fica em ${config.address.full}. Fica a cerca de 30 minutos de Lisboa e 20 minutos de Cascais. Estacionamento gratuito disponível. O ambiente é rodeado de natureza e serenidade, pensado para apoiar o seu processo de bem-estar.`,
        `The therapeutic space is located at ${config.address.full}. It is about 30 minutes from Lisbon and 20 minutes from Cascais. Free parking available. The environment is surrounded by nature and serenity, designed to support your well-being process.`
      ),
    },
    {
      q: t('A sessão Healing Touch é adequada para iniciantes?', 'Is the Healing Touch session suitable for beginners?'),
      a: t(
        'Sim, absolutamente. A sessão é adaptada a cada pessoa, independentemente da experiência prévia com terapias holísticas. Muitas pessoas vêm pela primeira vez à procura de uma massagem terapêutica e descobrem uma experiência muito mais profunda e transformadora. Não é necessária qualquer preparação especial — apenas disponibilidade para se cuidar.',
        'Yes, absolutely. The session is adapted to each person, regardless of previous experience with holistic therapies. Many people come for the first time looking for a therapeutic massage and discover a much deeper and more transformative experience. No special preparation is needed — just willingness to take care of yourself.'
      ),
    },
    {
      q: t('É necessária alguma preparação antes da sessão?', 'Is any preparation needed before the session?'),
      a: t(
        'Recomenda-se vir com roupa confortável e evitar refeições pesadas nas 2 horas anteriores à sessão. É importante chegar com alguns minutos de antecedência para poder relaxar e fazer a transição do ritmo do dia-a-dia. Não é necessário trazer nada específico — tudo o que precisa será fornecido no espaço.',
        'It is recommended to come in comfortable clothing and avoid heavy meals in the 2 hours before the session. It is important to arrive a few minutes early to relax and transition from the daily rhythm. There is no need to bring anything specific — everything you need will be provided at the space.'
      ),
    },
    {
      q: t('Qual a diferença entre a Sessão Healing Touch e a Imersão Pura Radiância?', 'What is the difference between the Healing Touch Session and the Pure Radiance Immersion?'),
      a: t(
        'A Sessão Healing Touch (~2h, 150€) é uma sessão terapêutica completa e personalizada, ideal para quem procura cuidado regular e equilíbrio. A Imersão Pura Radiância (~4h, 450€) é um mini-retiro individual mais longo e imersivo, pensado para quem precisa de uma pausa profunda e transformadora — inclui mais tempo, mais técnicas e um ambiente especialmente preparado como um verdadeiro ritual de reconexão.',
        'The Healing Touch Session (~2h, 150€) is a complete, personalized therapeutic session, ideal for those seeking regular care and balance. The Pure Radiance Immersion (~4h, 450€) is a longer, more immersive individual mini-retreat, designed for those who need a deep, transformative pause — it includes more time, more techniques and a specially prepared environment as a true reconnection ritual.'
      ),
    },
    {
      q: t('Os produtos Pure Earth Love são naturais?', 'Are Pure Earth Love products natural?'),
      a: t(
        'Sim, todos os produtos Pure Earth Love são feitos com óleos essenciais 100% naturais. Cada fórmula é criada de forma personalizada após uma breve sessão (presencial ou online), onde são delineadas as suas necessidades específicas. Os produtos são preparados de forma consciente e intencional, como uma extensão do processo terapêutico — um cuidado contínuo que pode levar consigo no dia-a-dia.',
        'Yes, all Pure Earth Love products are made with 100% natural essential oils. Each formula is created in a personalized way after a brief session (in-person or online), where your specific needs are outlined. Products are prepared consciously and intentionally, as an extension of the therapeutic process — continuous care you can take with you in your daily life.'
      ),
    },
    {
      q: t('Como posso agendar uma sessão?', 'How can I book a session?'),
      a: t(
        'Pode agendar através do WhatsApp (+351 914 173 445), por telefone ou por email (daniela@danielaalveshealing.com). Resposta habitual em menos de 24 horas.',
        'You can book via WhatsApp (+351 914 173 445), by phone or by email (daniela@danielaalveshealing.com). Usual response within 24 hours.'
      ),
    },
    {
      q: t('Existe Cheque-Oferta disponível?', 'Are Gift Vouchers available?'),
      a: t(
        'Sim, o Cheque-Oferta existe em formato físico ou digital e pode ser usado para qualquer um dos serviços. É uma forma especial de oferecer cuidado e bem-estar a alguém que ama. Entre em contacto para adquirir o seu.',
        'Yes, Gift Vouchers are available in physical or digital format and can be used for any of the services. It is a special way to offer care and well-being to someone you love. Get in touch to purchase yours.'
      ),
    },
    {
      q: t('Qual a política de cancelamento e reagendamento?', 'What is the cancellation and rescheduling policy?'),
      a: t(
        'Pedimos que o cancelamento ou reagendamento seja feito com pelo menos 24 horas de antecedência, para que possamos disponibilizar o horário a outra pessoa. Em caso de cancelamento com menos de 24 horas de antecedência, poderá ser cobrado um valor parcial. Compreendemos que imprevistos acontecem — entre em contacto o mais cedo possível para encontrarmos a melhor solução.',
        'We ask that cancellations or rescheduling be made at least 24 hours in advance, so we can offer the slot to another person. For cancellations with less than 24 hours notice, a partial fee may be charged. We understand that unexpected situations happen — please contact us as soon as possible so we can find the best solution.'
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
