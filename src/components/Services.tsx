import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flower2, Sun, Leaf, Home, MessageCircle, ChevronDown } from 'lucide-react';

const WA_BASE = 'https://wa.me/351914173445?text=';
const ROMAN = ['I', 'II', 'III', 'IV'];

const Services = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [expanded, setExpanded] = useState<number | null>(null);

  const services = [
    {
      icon: Flower2,
      title: t('Sessão Healing Touch', 'Healing Touch Session'),
      desc: t(
        'Sessão terapêutica personalizada para promover um equilíbrio e bem-estar profundos.',
        'Personalized therapeutic session to promote deep balance and well-being.'
      ),
      quote: t(
        '"O corpo sabe como regressar ao equilíbrio. Por vezes, só precisa de apoio para libertar o que ficou retido."',
        '"The body knows how to return to balance. Sometimes it just needs support to release what got stuck."'
      ),
      fullText: t(
        'Embora várias pessoas venham inicialmente para uma massagem terapêutica, o trabalho realizado vai muito além do relaxamento físico.\n\nCada sessão é uma viagem única, guiada por 17 anos de experiência, oferecendo um espaço seguro de cura e transformação, onde a escuta, o toque consciente e a presença apoiam a integração emocional e o alinhamento interno.\n\nCom base numa leitura inicial, a sessão é ajustada às necessidades e ao momento de cada pessoa.\n\nNuma visão integrativa de saúde e bem-estar, podem ser usadas diferentes técnicas: massagem, drenagem linfática manual, aromaterapia, terapia de som, meditação, técnicas energéticas ou de libertação emocional.',
        'Although many people initially come for a therapeutic massage, the work goes far beyond physical relaxation.\n\nEach session is a unique journey, guided by 17 years of experience, offering a safe space for healing and transformation, where listening, conscious touch and presence support emotional integration and internal alignment.\n\nBased on an initial reading, the session is adjusted to each person\'s needs and moment.\n\nIn an integrative vision of health and well-being, different techniques may be used: massage, manual lymphatic drainage, aromatherapy, sound therapy, meditation, energy techniques or emotional release.'
      ),
      duration: t('~2h', '~2h'),
      price: '150€',
      includes: t('Massagem, aromaterapia, terapia de som, meditação', 'Massage, aromatherapy, sound therapy, meditation'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de agendar uma Sessão Healing Touch.', 'Hello Daniela, I would like to book a Healing Touch Session.')),
    },
    {
      icon: Sun,
      title: t('Imersão Pura Radiância', 'Pure Radiance Immersion'),
      desc: t(
        'Uma experiência exclusiva de pura nutrição e cuidado, com mais tempo para Relaxar, Recentrar e Reconectar.',
        'An exclusive experience of pure nourishment and care, with more time to Relax, Recenter and Reconnect.'
      ),
      quote: t('"Mais do que uma sessão, é um tempo Ritual."', '"More than a session, it is a Ritual time."'),
      fullText: t(
        'A Imersão Pure Radiance é um mini-retiro individual, ideal para quem precisa de uma pausa relaxante, transformadora e intencional.\n\nUm espaço mais longo, de forma a poder sair mais facilmente do ritmo do dia-a-dia, desligar-se do que está fora e a regressar a si.\n\nRealizada num ambiente rodeado de natureza e serenidade, em que cada detalhe é pensado para apoiar o seu processo e bem-estar.\n\nMais do que uma sessão, é um tempo Ritual — um convite a reconectar-se com a sua Essência.',
        'The Pure Radiance Immersion is an individual mini-retreat, ideal for those who need a relaxing, transformative and intentional pause.\n\nA longer space, allowing you to more easily step out of the daily rhythm, disconnect from the outside and return to yourself.\n\nHeld in an environment surrounded by nature and serenity, where every detail is designed to support your process and well-being.\n\nMore than a session, it is a Ritual time — an invitation to reconnect with your Essence.'
      ),
      duration: t('~4h', '~4h'),
      price: '450€',
      includes: t('Mini-retiro completo, múltiplas técnicas, ambiente natural', 'Complete mini-retreat, multiple techniques, natural setting'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre a Imersão Pura Radiância.', 'Hello Daniela, I would like to know more about the Pure Radiance Immersion.')),
    },
    {
      icon: Leaf,
      title: 'Pure Earth Love',
      desc: t(
        'Produtos de Aromaterapia exclusivos e personalizados. Este é Puro Amor da Terra para si!',
        'Exclusive and personalized Aromatherapy products. This is Pure Earth Love for you!'
      ),
      quote: t(
        '"Que cada gota de Pure Earth Love seja um abraço aromático, inspirando a florescer mais a sua luz interior!"',
        '"May each drop of Pure Earth Love be an aromatic embrace, inspiring your inner light to bloom!"'
      ),
      fullText: t(
        'Pure Earth Love é uma linha de aromaterapia personalizada que potencia os benefícios dos óleos essenciais 100% naturais com uma abordagem intuitiva e amorosa.\n\nAtravés de uma breve sessão (presencial ou online), delineamos as suas necessidades e definimos uma fórmula única, pensada para apoiar o seu equilíbrio e bem-estar.\n\nCada produto é preparado de forma consciente e intencional, como uma extensão do processo terapêutico — um suporte subtil para integrar e prolongar os efeitos do trabalho realizado e um cuidado contínuo, que pode ser levado consigo no dia-a-dia.',
        'Pure Earth Love is a personalized aromatherapy line that enhances the benefits of 100% natural essential oils with an intuitive and loving approach.\n\nThrough a brief session (in-person or online), we outline your needs and define a unique formula, designed to support your balance and well-being.\n\nEach product is prepared consciously and intentionally, as an extension of the therapeutic process — a subtle support to integrate and prolong the effects of the work done and a continuous care that you can take with you in your daily life.'
      ),
      duration: t('~30 min', '~30 min'),
      price: '80€',
      includes: t('Sessão + produto personalizado de óleos essenciais', 'Session + personalized essential oils product'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre os produtos Pure Earth Love.', 'Hello Daniela, I would like to know more about Pure Earth Love products.')),
    },
    {
      icon: Home,
      title: 'Home Harmony',
      desc: t(
        'Organização Holística de Espaços — quando a casa está harmoniosa, as várias áreas da vida fluem com mais leveza.',
        'Holistic Space Organization — when the home is harmonious, various areas of life flow with more lightness.'
      ),
      quote: t(
        '"Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!"',
        '"May your Home be a true Haven that amplifies your Inner Harmony!"'
      ),
      fullText: t(
        'Se o corpo é o Templo onde habitamos, a casa é o espaço que nos acolhe e sustenta no dia-a-dia e um dos locais onde passamos mais tempo, influenciando-nos de forma directa e indirecta.\n\nIdealmente é um local que nos nutre e acolhe, um local seguro, confortável, prático e bonito de acordo com os nossos gostos e necessidades.\n\nO Home Harmony é um serviço de organização holística que apoia a transformação do seu espaço de forma consciente, prática e alinhada consigo. Mais do que organizar, este trabalho propõe uma abordagem integrada entre pessoa e espaço — onde não só se cria ordem e funcionalidade, mas também uma relação mais harmoniosa com a casa.\n\nCom base numa leitura do momento e das suas necessidades, vamos ajustando o espaço de forma intuitiva e personalizada, respeitando o seu ritmo, os seus gostos e a realidade do seu dia-a-dia.\n\nSem rigidez ou perfeccionismo — não se trata de criar uma casa "perfeita", mas um espaço vivo, acolhedor e funcional, que o(a) apoie e reflita.\n\nEste processo decorre geralmente ao longo de várias visitas, permitindo uma transformação progressiva, sustentável e integrada, com atenção ao uso de materiais e soluções mais naturais e saudáveis.',
        'If the body is the Temple where we dwell, the home is the space that welcomes and sustains us daily and one of the places where we spend the most time, influencing us directly and indirectly.\n\nIdeally it is a place that nourishes and welcomes us, a safe, comfortable, practical and beautiful place according to our tastes and needs.\n\nHome Harmony is a holistic organization service that supports the transformation of your space in a conscious, practical and aligned way. More than organizing, this work proposes an integrated approach between person and space — where not only order and functionality are created, but also a more harmonious relationship with the home.\n\nBased on a reading of the moment and your needs, we adjust the space intuitively and personally, respecting your rhythm, your tastes and the reality of your daily life.\n\nWithout rigidity or perfectionism — it is not about creating a "perfect" home, but a living, welcoming and functional space that supports and reflects you.\n\nThis process generally takes place over several visits, allowing for a progressive, sustainable and integrated transformation, with attention to the use of more natural and healthy materials and solutions.'
      ),
      duration: t('A combinar', 'To be arranged'),
      price: t('Por consulta', 'By consultation'),
      includes: t('Visitas ao domicílio, leitura personalizada, organização progressiva', 'Home visits, personalized reading, progressive organization'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre o serviço Home Harmony.', 'Hello Daniela, I would like to know more about the Home Harmony service.')),
    },
  ];

  return (
    <section
      id="servicos"
      className="py-24 lg:py-36 relative overflow-hidden noise-overlay"
      style={{
        background: 'radial-gradient(circle at 50% 35%, hsl(var(--primary) / 0.18) 0%, transparent 34%), radial-gradient(circle at 85% 85%, hsl(var(--gold) / 0.16) 0%, transparent 32%), linear-gradient(180deg, hsl(var(--section-lilac-strong)) 0%, hsl(var(--section-lilac)) 55%, hsl(var(--section-warm-soft)) 100%)',
      }}
    >
      {/* Radial depth glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/[0.14] rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gold/[0.10] rounded-full blur-3xl pointer-events-none" />

      {/* Botanical SVG decoration */}
      <svg className="absolute top-20 right-0 w-64 h-64 text-gold/[0.04] pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M100 10C100 60 60 100 10 100C60 100 100 140 100 190C100 140 140 100 190 100C140 100 100 60 100 10Z" />
        <circle cx="100" cy="100" r="30" />
        <circle cx="100" cy="100" r="60" />
      </svg>
      <svg className="absolute bottom-20 left-0 w-48 h-48 text-primary/[0.03] pointer-events-none" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M100 30C100 70 70 100 30 100C70 100 100 130 100 170C100 130 130 100 170 100C130 100 100 70 100 30Z" />
        <circle cx="100" cy="100" r="20" />
      </svg>

      {/* Floating gold accent dots */}
      <div className="absolute top-1/4 left-8 w-2 h-2 rounded-full bg-gold/20 animate-float-gentle" />
      <div className="absolute top-1/3 right-12 w-1.5 h-1.5 rounded-full bg-gold/15 animate-float-gentle" style={{ animationDelay: '1s' }} />
      <div className="absolute bottom-1/4 left-16 w-1 h-1 rounded-full bg-gold/25 animate-float-gentle" style={{ animationDelay: '2s' }} />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section header — SEO-optimized heading */}
        <div className={`text-center mb-20 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Cuidar de Ti', 'Caring for You')}</p>
          <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-6 text-balance">
            {t('Terapias Holísticas em Sintra', 'Holistic Therapies in Sintra')}
          </h2>
          <div className="section-divider mb-6" />
          <p className="text-muted-foreground max-w-lg mx-auto text-sm leading-relaxed text-pretty">
            {t('Sessões para uma Harmonia profunda do Ser, de Corpo e Alma!', 'Sessions for a deep Harmony of Being, Body and Soul!')}
          </p>
        </div>

        {/* Service cards with inline expandable content */}
        <div className="grid md:grid-cols-2 gap-6 lg:gap-10">
          {services.map((s, i) => {
            const isExpanded = expanded === i;
            return (
              <Card
                key={i}
                className={`group relative overflow-hidden border-0 transition-all duration-700 hover:-translate-y-3 hover:shadow-[0_25px_60px_-15px_hsl(var(--primary)/0.2)] ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
                }`}
                style={{
                  transitionDelay: isVisible ? `${i * 200}ms` : '0ms',
                  marginTop: 0,
                  background: 'linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--mist)) 50%, hsl(var(--cream)) 100%)',
                }}
              >
                {/* Gold accent line */}
                <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-gold to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Hover gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-gold/0 to-gold/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <CardContent className="p-10 lg:p-12 flex flex-col items-center text-center h-full relative">
                  {/* Roman numeral */}
                  <span className="absolute top-6 right-8 font-serif text-5xl font-extralight text-primary/[0.06] select-none pointer-events-none group-hover:text-primary/[0.12] transition-colors duration-700">
                    {ROMAN[i]}
                  </span>

                  {/* Icon */}
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-8 relative z-10 transition-all duration-500 group-hover:scale-110 group-hover:shadow-[0_0_30px_hsl(var(--gold)/0.2)]" style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--primary) / 0.1))',
                    border: '1px solid hsl(var(--gold) / 0.3)',
                  }}>
                    <s.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>

                  <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-5 tracking-wider">{s.title}</h3>
                  <p className="text-muted-foreground text-base leading-relaxed mb-5 text-pretty">{s.desc}</p>
                  <p className="font-serif italic text-sm text-primary/60 mb-6 leading-relaxed">{s.quote}</p>

                  {/* Price & duration — always visible */}
                  <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm mb-6 pt-4 border-t border-gold/10 w-full">
                    <span className="text-foreground/70 tracking-wide font-light">{s.duration}</span>
                    <span className="font-serif text-lg text-gold tracking-wide" style={{ fontVariantNumeric: 'oldstyle-nums' }}>{s.price}</span>
                  </div>

                  {/* Expandable full description */}
                  <div
                    className={`overflow-hidden transition-all duration-500 w-full ${isExpanded ? 'max-h-[600px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="text-muted-foreground text-sm leading-relaxed text-pretty space-y-3 text-left pt-2 border-t border-gold/10">
                      {s.fullText.split('\n\n').map((paragraph, idx) => (
                        <p key={idx}>{paragraph}</p>
                      ))}
                    </div>
                  </div>

                  {/* Saber mais toggle */}
                  <Button
                    variant="ghost"
                    className="rounded-full text-xs tracking-[0.15em] uppercase text-foreground/60 hover:text-foreground hover:bg-muted transition-all group-hover:text-gold mb-4"
                    onClick={() => setExpanded(isExpanded ? null : i)}
                    aria-expanded={isExpanded}
                  >
                    {isExpanded
                      ? t('Fechar', 'Close')
                      : t('Saber mais', 'Learn more')
                    }
                    <ChevronDown className={`ml-1.5 h-3.5 w-3.5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                  </Button>

                  {/* WhatsApp CTA — always visible */}
                  <a href={`${WA_BASE}${s.wa}`} target="_blank" rel="noopener noreferrer" className="w-full mt-auto">
                    <Button className="w-full bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                      <MessageCircle className="h-4 w-4" />
                      {t('Agendar via WhatsApp', 'Book via WhatsApp')}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison table — highly citable by AI & Google Featured Snippets */}
        <div className={`mt-20 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h3 className="font-serif text-2xl md:text-3xl font-extralight text-foreground tracking-wider text-center mb-8">
            {t('Comparar Serviços', 'Compare Services')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse glass-card rounded-lg overflow-hidden">
              <thead>
                <tr className="border-b border-gold/15">
                  <th className="text-left py-4 px-5 font-serif font-light text-foreground tracking-wider">{t('Serviço', 'Service')}</th>
                  <th className="text-center py-4 px-5 font-serif font-light text-foreground tracking-wider">{t('Duração', 'Duration')}</th>
                  <th className="text-center py-4 px-5 font-serif font-light text-foreground tracking-wider">{t('Preço', 'Price')}</th>
                  <th className="text-left py-4 px-5 font-serif font-light text-foreground tracking-wider hidden sm:table-cell">{t('Inclui', 'Includes')}</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s, i) => (
                  <tr key={i} className={`border-b border-gold/5 last:border-b-0 transition-colors hover:bg-gold/[0.03] ${i % 2 === 0 ? 'bg-background/30' : ''}`}>
                    <td className="py-4 px-5 font-serif text-foreground tracking-wide">{s.title}</td>
                    <td className="py-4 px-5 text-center text-muted-foreground">{s.duration}</td>
                    <td className="py-4 px-5 text-center font-serif text-gold text-lg" style={{ fontVariantNumeric: 'oldstyle-nums' }}>{s.price}</td>
                    <td className="py-4 px-5 text-muted-foreground text-xs leading-relaxed hidden sm:table-cell">{s.includes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Services;
