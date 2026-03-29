import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Home, Sparkles, Compass, Star, MessageCircle, ArrowLeft, Eye, Palette, Repeat, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const WA_BASE = 'https://wa.me/351914173445?text=';
const WA_CONSULTA = `${WA_BASE}${encodeURIComponent('Olá Daniela, gostaria de agendar uma consulta inicial para o Home Harmony.')}`;
const WA_DELUXE = `${WA_BASE}${encodeURIComponent('Olá Daniela, gostaria de saber mais sobre o Home Harmony Deluxe.')}`;

const HomeHarmonyPage = () => {
  const { t } = useLanguage();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation(0.05);
  const { ref: pillarsRef, isVisible: pillarsVisible } = useScrollAnimation();
  const { ref: processRef, isVisible: processVisible } = useScrollAnimation();
  const { ref: compareRef, isVisible: compareVisible } = useScrollAnimation();
  const { ref: deluxeRef, isVisible: deluxeVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();

  const pillars = [
    {
      icon: Eye,
      title: t('Leitura Intuitiva', 'Intuitive Reading'),
      desc: t('Cada espaço é único. Começamos por compreender o momento, as necessidades e a essência de quem habita.', 'Each space is unique. We start by understanding the moment, the needs and the essence of those who live there.'),
    },
    {
      icon: Palette,
      title: t('Transformação Consciente', 'Conscious Transformation'),
      desc: t('Organização personalizada que respeita o seu ritmo, gostos e realidade — sem rigidez ou perfeccionismo.', 'Personalized organization that respects your rhythm, tastes and reality — without rigidity or perfectionism.'),
    },
    {
      icon: Repeat,
      title: t('Integração Sustentável', 'Sustainable Integration'),
      desc: t('Várias visitas para uma mudança progressiva e duradoura, com materiais naturais e soluções saudáveis.', 'Several visits for a progressive and lasting change, with natural materials and healthy solutions.'),
    },
  ];

  const partners = [
    {
      icon: Sparkles,
      title: t('Limpeza Energética', 'Energy Cleansing'),
      partner: 'Bilal Machraa',
      desc: t(
        'Libertação de memórias e energias estagnadas que possam bloquear o bem-estar, devolvendo ao espaço a sua frequência natural.',
        'Release of memories and stagnant energies that may block well-being, returning the space to its natural frequency.'
      ),
      note: t('Presencial ou à distância', 'In-person or remote'),
    },
    {
      icon: Compass,
      title: 'Feng Shui',
      partner: 'Cristina Dionísio',
      desc: t(
        'Posicionamento estratégico de elementos, cores e formas para potencializar o fluxo de energia positiva em cada ambiente.',
        'Strategic positioning of elements, colors and shapes to enhance positive energy flow in each environment.'
      ),
      note: t('Leitura energética + orientações', 'Energy reading + guidance'),
    },
    {
      icon: Star,
      title: t('Astrologia do Ki', 'Ki Astrology'),
      partner: 'Cristina Dionísio',
      desc: t(
        'Compreensão de padrões pessoais para maior alinhamento entre a sua essência e o espaço habitado.',
        'Understanding personal patterns for greater alignment between your essence and the inhabited space.'
      ),
      note: t('Leitura personalizada', 'Personalized reading'),
    },
  ];

  const faqs = [
    {
      q: t('Como funciona o processo passo-a-passo?', 'How does the step-by-step process work?'),
      a: t(
        'Tudo começa com uma consulta inicial onde fazemos uma leitura do espaço e das suas necessidades. A partir daí, criamos um plano personalizado e avançamos ao longo de várias visitas, transformando cada área ao seu ritmo. Não há pressão — o processo é progressivo e respeitador.',
        'Everything starts with an initial consultation where we read the space and your needs. From there, we create a personalized plan and progress over several visits, transforming each area at your pace. There is no pressure — the process is progressive and respectful.'
      ),
    },
    {
      q: t('Quanto tempo demora a transformação?', 'How long does the transformation take?'),
      a: t(
        'Depende da dimensão do espaço e da profundidade da transformação desejada. Tipicamente, o processo decorre entre 4 a 12 semanas, com sessões presenciais regulares. Cada caso é único e o ritmo é sempre definido consigo.',
        'It depends on the size of the space and the depth of transformation desired. Typically, the process takes between 4 to 12 weeks, with regular in-person sessions. Each case is unique and the pace is always set with you.'
      ),
    },
    {
      q: t('Qual a diferença entre Home Harmony e Home Harmony Deluxe?', 'What is the difference between Home Harmony and Home Harmony Deluxe?'),
      a: t(
        'O Home Harmony foca-se na organização holística do espaço — leitura, reorganização e harmonização prática. O Deluxe vai mais fundo: integra serviços complementares como limpeza energética, Feng Shui e Astrologia do Ki, para quem deseja uma transformação nas dimensões física, energética e de autoconhecimento.',
        'Home Harmony focuses on holistic space organization — reading, reorganization and practical harmonization. Deluxe goes deeper: it integrates complementary services like energy cleansing, Feng Shui and Ki Astrology, for those who desire a transformation across physical, energetic and self-knowledge dimensions.'
      ),
    },
    {
      q: t('Preciso de escolher todos os complementos do Deluxe?', 'Do I need to choose all Deluxe add-ons?'),
      a: t(
        'Não. O Home Harmony Deluxe é modular — escolhe apenas os complementos que fazem sentido para si. Pode integrar um, dois ou os três serviços parceiros, conforme as suas necessidades e interesse.',
        'No. Home Harmony Deluxe is modular — you choose only the add-ons that make sense for you. You can integrate one, two or all three partner services, according to your needs and interest.'
      ),
    },
    {
      q: t('Trabalham apenas em Sintra?', 'Do you only work in Sintra?'),
      a: t(
        'As sessões presenciais realizam-se na zona de Sintra, Lisboa e Cascais. A limpeza energética com Bilal Machraa também está disponível à distância. Para projetos fora destas zonas, entre em contacto para avaliarmos a viabilidade.',
        'In-person sessions take place in the Sintra, Lisbon and Cascais area. Energy cleansing with Bilal Machraa is also available remotely. For projects outside these areas, get in touch so we can assess feasibility.'
      ),
    },
    {
      q: t('Qual o investimento?', 'What is the investment?'),
      a: t(
        'Cada projeto é único e o investimento é personalizado com base na dimensão do espaço, profundidade da transformação e complementos escolhidos. Agende uma consulta inicial para receber uma proposta detalhada e sem compromisso.',
        'Each project is unique and the investment is personalized based on the size of the space, depth of transformation and chosen add-ons. Schedule an initial consultation to receive a detailed, no-obligation proposal.'
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/50 via-foreground/60 to-foreground/85" />

        <Link to="/" className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('Voltar', 'Back')}
        </Link>

        <div ref={heroRef} className={`relative z-10 text-center px-4 max-w-3xl mx-auto transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">{t('Organização Holística de Espaços', 'Holistic Space Organization')}</p>
          <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-8 bg-white/5 backdrop-blur-sm">
            <Home className="h-9 w-9 text-gold" strokeWidth={1} />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extralight text-white tracking-wider mb-8">
            Home Harmony
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-10">
            {t(
              'Transforme o seu espaço num refúgio de bem-estar. Uma abordagem única que integra organização, harmonia e intenção.',
              'Transform your space into a well-being refuge. A unique approach that integrates organization, harmony and intention.'
            )}
          </p>
          <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-foreground gap-2.5 rounded-full px-10 py-6 text-sm tracking-[0.12em] uppercase font-medium transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--gold)/0.3)] hover:scale-105">
              {t('Agendar Consulta Inicial', 'Schedule Initial Consultation')}
            </Button>
          </a>
          <p className="text-white/40 text-sm mt-4">{t('Consulta inicial sem compromisso', 'No-obligation initial consultation')}</p>
        </div>
      </section>

      {/* ─── Opening Quote ─── */}
      <section className="py-20 lg:py-24 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--section-warm) / 0.5) 100%)' }}>
        <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
          <div className="relative">
            <span className="absolute -top-8 left-1/2 -translate-x-10 font-serif text-7xl text-gold/15 select-none leading-none">"</span>
            <p className="font-serif text-2xl md:text-3xl font-extralight text-foreground/80 leading-[1.6] px-6">
              {t(
                'Se o corpo é o Templo onde habitamos, a casa é o espaço que nos acolhe e sustenta no dia-a-dia.',
                'If the body is the Temple where we dwell, the home is the space that welcomes and sustains us daily.'
              )}
            </p>
          </div>
          <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mt-6">— Daniela Alves</p>
        </div>
      </section>

      {/* ─── 3 Pillars ─── */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm) / 0.5) 0%, hsl(var(--section-lilac)) 100%)' }}>
        <div ref={pillarsRef} className="container mx-auto px-4 lg:px-8 max-w-5xl">
          <div className={`text-center mb-16 transition-all duration-700 ${pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Metodologia', 'Methodology')}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-extralight text-foreground tracking-wider mb-4">
              {t('Três Pilares de Transformação', 'Three Pillars of Transformation')}
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto" />
          </div>

          <div className="grid md:grid-cols-3 gap-10 lg:gap-14">
            {pillars.map((p, i) => (
              <div
                key={i}
                className={`text-center transition-all duration-700 ${pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
                style={{ transitionDelay: pillarsVisible ? `${i * 200}ms` : '0ms' }}
              >
                <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{
                  background: 'linear-gradient(135deg, hsl(var(--gold) / 0.12), hsl(var(--primary) / 0.08))',
                  border: '1px solid hsl(var(--gold) / 0.25)',
                }}>
                  <p.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                </div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/60 mb-3">{String(i + 1).padStart(2, '0')}</p>
                <h3 className="font-serif text-xl md:text-2xl font-light text-foreground tracking-wider mb-4">{p.title}</h3>
                <p className="text-foreground/70 text-[17px] leading-[1.85]">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Full-bleed image band ─── */}
      <div className="w-full h-[120px] md:h-[180px] overflow-hidden">
        <div className="w-full h-full" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1484101403633-562f891dc89a?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 55%',
        }} />
      </div>

      {/* ─── O Processo ─── */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-lilac)) 0%, hsl(var(--section-warm-soft)) 100%)' }}>
        <div ref={processRef} className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className={`transition-all duration-700 ${processVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-14">
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Como Funciona', 'How It Works')}</p>
              <h2 className="font-serif text-3xl md:text-4xl font-extralight text-foreground tracking-wider mb-4">
                {t('O Processo', 'The Process')}
              </h2>
              <div className="w-12 h-px bg-gold/40 mx-auto" />
            </div>

            <div className="border-l-2 border-gold/25 pl-8 md:pl-12 space-y-8">
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/60 mb-2">{t('Passo 1', 'Step 1')}</p>
                <h3 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">{t('Consulta Inicial', 'Initial Consultation')}</h3>
                <p className="text-foreground/75 text-[17px] leading-[1.85]">
                  {t(
                    'Uma conversa para compreender o seu momento, as suas necessidades e a relação com o espaço. A partir desta leitura, definimos juntos o caminho a seguir.',
                    'A conversation to understand your moment, your needs and your relationship with the space. From this reading, we define together the path forward.'
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/60 mb-2">{t('Passo 2', 'Step 2')}</p>
                <h3 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">{t('Transformação Progressiva', 'Progressive Transformation')}</h3>
                <p className="text-foreground/75 text-[17px] leading-[1.85]">
                  {t(
                    'Ao longo de várias visitas, reorganizamos e harmonizamos cada área do seu espaço — de forma intuitiva, personalizada e ao seu ritmo. Sem rigidez, sem perfeccionismo.',
                    'Over several visits, we reorganize and harmonize each area of your space — intuitively, personally and at your pace. No rigidity, no perfectionism.'
                  )}
                </p>
              </div>
              <div>
                <p className="text-[10px] tracking-[0.25em] uppercase text-gold/60 mb-2">{t('Passo 3', 'Step 3')}</p>
                <h3 className="font-serif text-xl font-light text-foreground tracking-wider mb-3">{t('Integração Duradoura', 'Lasting Integration')}</h3>
                <p className="text-foreground/75 text-[17px] leading-[1.85]">
                  {t(
                    'O resultado é um espaço vivo, acolhedor e funcional que o(a) apoia e reflita — com atenção a materiais naturais e soluções sustentáveis que perduram.',
                    'The result is a living, welcoming and functional space that supports and reflects you — with attention to natural materials and sustainable solutions that last.'
                  )}
                </p>
              </div>
            </div>

            {/* CTA mid-page */}
            <div className="text-center mt-14">
              <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer">
                <Button className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-foreground gap-2.5 rounded-full px-10 text-sm tracking-[0.12em] uppercase font-medium transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--gold)/0.3)]">
                  {t('Agendar Consulta Inicial', 'Schedule Initial Consultation')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Comparison: HH vs HH Deluxe ─── */}
      <section className="py-28 lg:py-36 relative overflow-hidden noise-overlay" style={{
        background: 'radial-gradient(circle at 50% 35%, hsl(var(--primary) / 0.12) 0%, transparent 34%), linear-gradient(180deg, hsl(var(--section-lilac-strong)) 0%, hsl(var(--section-lilac)) 100%)',
      }}>
        <div ref={compareRef} className="container mx-auto px-4 lg:px-8 max-w-4xl">
          <div className={`text-center mb-14 transition-all duration-700 ${compareVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Escolha o Seu Caminho', 'Choose Your Path')}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-extralight text-foreground tracking-wider mb-4">
              {t('Dois Programas, Uma Essência', 'Two Programs, One Essence')}
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto" />
          </div>

          {/* Side-by-side comparison */}
          <div className={`grid md:grid-cols-2 gap-6 lg:gap-8 transition-all duration-700 delay-200 ${compareVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {/* Home Harmony */}
            <div className="rounded-2xl border border-gold/10 p-8 md:p-10" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--mist)) 100%)' }}>
              <h3 className="font-serif text-2xl md:text-3xl font-extralight text-foreground tracking-wider mb-2">Home Harmony</h3>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-8">{t('Organização Holística', 'Holistic Organization')}</p>

              <ul className="space-y-4 mb-10">
                {[
                  t('Leitura inicial do espaço e necessidades', 'Initial space and needs reading'),
                  t('Plano de transformação personalizado', 'Personalized transformation plan'),
                  t('Várias sessões presenciais ao seu ritmo', 'Several in-person sessions at your pace'),
                  t('Organização intuitiva e funcional', 'Intuitive and functional organization'),
                  t('Materiais naturais e soluções sustentáveis', 'Natural materials and sustainable solutions'),
                  t('Acompanhamento pós-transformação', 'Post-transformation follow-up'),
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Check className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={2} />
                    <span className="text-foreground/75 text-[15px] leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-6 border-t border-gold/10 text-center">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{t('Investimento', 'Investment')}</p>
                <p className="font-serif text-lg text-foreground tracking-wide mb-6">{t('Personalizado por projeto', 'Personalized per project')}</p>
                <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-foreground hover:bg-foreground/90 text-background gap-2 rounded-full text-xs tracking-[0.12em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                    <MessageCircle className="h-4 w-4" />
                    {t('Pedir Proposta', 'Request Proposal')}
                  </Button>
                </a>
              </div>
            </div>

            {/* Home Harmony Deluxe */}
            <div className="rounded-2xl border-2 border-gold/30 p-8 md:p-10 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--cream)) 100%)' }}>
              {/* Premium badge */}
              <div className="absolute top-4 right-4">
                <span className="inline-block text-[9px] tracking-[0.2em] uppercase text-gold bg-gold/10 border border-gold/20 px-3 py-1 rounded-full font-medium">
                  {t('Mais Completo', 'Most Complete')}
                </span>
              </div>
              {/* Top gold line */}
              <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-gold/40 via-gold to-gold/40" />

              <h3 className="font-serif text-2xl md:text-3xl font-extralight text-foreground tracking-wider mb-2">
                Home Harmony <span className="text-gold">Deluxe</span>
              </h3>
              <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-8">{t('Transformação Integral', 'Integral Transformation')}</p>

              <ul className="space-y-4 mb-4">
                {[
                  { text: t('Tudo incluído no Home Harmony', 'Everything included in Home Harmony'), bold: true },
                  t('Integração de dimensões energéticas', 'Integration of energetic dimensions'),
                  t('Autoconhecimento aplicado ao espaço', 'Self-knowledge applied to the space'),
                ].map((item, i) => {
                  const isBold = typeof item === 'object';
                  return (
                    <li key={i} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-gold mt-1 shrink-0" strokeWidth={2} />
                      <span className={`text-[15px] leading-relaxed ${isBold ? 'text-foreground font-medium' : 'text-foreground/75'}`}>
                        {isBold ? item.text : item}
                      </span>
                    </li>
                  );
                })}
              </ul>

              {/* Add-on badges */}
              <p className="text-[10px] tracking-[0.15em] uppercase text-muted-foreground mb-3 mt-6">
                {t('+ Complementos à sua escolha:', '+ Add-ons of your choice:')}
              </p>
              <div className="flex flex-wrap gap-2 mb-10">
                {[
                  t('Limpeza Energética', 'Energy Cleansing'),
                  'Feng Shui',
                  t('Astrologia do Ki', 'Ki Astrology'),
                ].map((label, i) => (
                  <span key={i} className="text-xs tracking-wide text-gold/80 border border-gold/20 px-3 py-1.5 rounded-full bg-gold/[0.03]">
                    {label}
                  </span>
                ))}
              </div>

              <div className="pt-6 border-t border-gold/15 text-center">
                <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{t('Investimento', 'Investment')}</p>
                <p className="font-serif text-lg text-gold tracking-wide mb-6">{t('Personalizado por projeto', 'Personalized per project')}</p>
                <a href={WA_DELUXE} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-foreground gap-2 rounded-full text-xs tracking-[0.12em] uppercase font-medium transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--gold)/0.3)]">
                    <MessageCircle className="h-4 w-4" />
                    {t('Pedir Proposta Deluxe', 'Request Deluxe Proposal')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Deluxe Partners Detail ─── */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, hsl(var(--section-lilac)) 0%, hsl(var(--section-warm-soft)) 100%)',
      }}>
        <div ref={deluxeRef} className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className={`text-center mb-14 transition-all duration-700 ${deluxeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Parcerias Exclusivas', 'Exclusive Partnerships')}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-extralight text-foreground tracking-wider mb-4">
              {t('Complementos Deluxe', 'Deluxe Add-ons')}
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-8" />
            <p className="text-foreground/70 text-[17px] max-w-2xl mx-auto leading-[1.85]">
              {t(
                'Profissionais de confiança, cuidadosamente selecionados para complementar a transformação do seu espaço.',
                'Trusted professionals, carefully selected to complement the transformation of your space.'
              )}
            </p>
          </div>

          <div ref={cardsRef} className="grid md:grid-cols-3 gap-6 lg:gap-10 max-w-5xl mx-auto">
            {partners.map((p, i) => (
              <Card
                key={i}
                className={`group relative overflow-hidden border-0 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.2)] ${
                  cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{
                  transitionDelay: cardsVisible ? `${i * 200}ms` : '0ms',
                  background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--mist)) 50%, hsl(var(--cream)) 100%)',
                }}
              >
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                <CardContent className="p-8 lg:p-10 flex flex-col h-full relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--primary) / 0.1))',
                    border: '1px solid hsl(var(--gold) / 0.3)',
                  }}>
                    <p.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif text-xl md:text-2xl font-light text-foreground mb-1 tracking-wider">{p.title}</h3>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gold/70 mb-5">{t('com', 'with')} {p.partner}</p>
                  <p className="text-foreground/75 text-[17px] leading-[1.85] mb-6 text-pretty flex-grow">{p.desc}</p>
                  <p className="text-sm text-gold/60 italic">{p.note}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-28 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--section-blush)) 52%, hsl(var(--section-warm-soft)) 100%)' }}>
        <div ref={faqRef} className="container mx-auto px-4 lg:px-8 max-w-3xl">
          <div className={`text-center mb-14 transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Dúvidas', 'Questions')}</p>
            <h2 className="font-serif text-3xl md:text-4xl font-extralight text-foreground tracking-wider mb-4">
              {t('Perguntas Frequentes', 'Frequently Asked Questions')}
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto" />
          </div>

          <Accordion type="single" collapsible className={`transition-all duration-700 ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
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
                <AccordionContent className="text-muted-foreground leading-relaxed px-6 pb-6 pl-11 text-pretty text-[15px]">
                  {faq.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-28 lg:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--background)) 100%)' }}>
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <div className="max-w-xl mx-auto">
            <div className="relative mb-10">
              <span className="absolute -top-6 left-1/2 -translate-x-12 font-serif text-6xl text-gold/15 select-none leading-none">"</span>
              <p className="font-serif italic text-2xl md:text-3xl text-foreground/65 leading-relaxed px-6">
                {t(
                  'Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!',
                  'May your Home be a true Haven that amplifies your Inner Harmony!'
                )}
              </p>
            </div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-10">— Daniela Alves</p>
            <a href={WA_CONSULTA} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-gradient-to-r from-gold to-gold-dark hover:from-gold-dark hover:to-gold text-foreground gap-2.5 rounded-full px-12 py-6 text-sm tracking-[0.12em] uppercase font-medium transition-all duration-300 hover:shadow-[0_8px_30px_hsl(var(--gold)/0.3)] hover:scale-105">
                {t('Agendar a Minha Consulta', 'Schedule My Consultation')}
              </Button>
            </a>
            <p className="text-muted-foreground/50 text-sm mt-4">{t('Sem compromisso. O primeiro passo para transformar o seu espaço.', 'No obligation. The first step to transforming your space.')}</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeHarmonyPage;
