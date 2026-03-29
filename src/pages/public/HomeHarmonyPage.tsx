import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Home, Sparkles, Compass, Star, MessageCircle, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const WA_BASE = 'https://wa.me/351914173445?text=';

const HomeHarmonyPage = () => {
  const { t } = useLanguage();
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation(0.05);
  const { ref: baseRef, isVisible: baseVisible } = useScrollAnimation();
  const { ref: deluxeRef, isVisible: deluxeVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation();

  const partners = [
    {
      icon: Sparkles,
      title: t('Limpeza Energética', 'Energy Cleansing'),
      partner: 'Bilal Machraa',
      desc: t(
        'Uma abordagem subtil e poderosa, que atua ao nível energético do espaço. Por vezes, certos ambientes podem refletir ou sustentar padrões menos harmoniosos, que influenciam o bem-estar de quem lá vive, ainda que de forma não evidente.',
        'A subtle and powerful approach that works at the energetic level of the space. Sometimes, certain environments may reflect or sustain less harmonious patterns that influence the well-being of those who live there, even if not obviously.'
      ),
      detail: t(
        'Esta Limpeza Energética facilita a libertação de memórias, energias estagnadas e padrões invisíveis que possam estar a bloquear o bem-estar, devolvendo ao espaço a sua frequência natural e contribuindo para um ambiente renovado, mais alinhado e acolhedor.',
        'This Energy Cleansing facilitates the release of memories, stagnant energies and invisible patterns that may be blocking well-being, returning the space to its natural frequency and contributing to a renewed, more aligned and welcoming environment.'
      ),
      note: t('Disponível presencialmente ou à distância', 'Available in-person or remotely'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre a Limpeza Energética com o Home Harmony.', 'Hello Daniela, I would like to know more about Energy Cleansing with Home Harmony.')),
    },
    {
      icon: Compass,
      title: 'Feng Shui',
      partner: 'Cristina Dionísio',
      desc: t(
        'O Feng Shui é uma abordagem milenar que procura harmonizar os espaços de forma a apoiar o bem-estar e a prosperidade em todas as áreas da vida.',
        'Feng Shui is an ancient approach that seeks to harmonize spaces to support well-being and prosperity in all areas of life.'
      ),
      detail: t(
        'Parte do princípio de que os ambientes influenciam diretamente a forma como nos sentimos, pensamos e vivemos — e através do posicionamento estratégico de elementos, cores e formas, potencializa o fluxo dessa energia positiva, transformando cada ambiente num catalisador de prosperidade e realização.',
        'It is based on the principle that environments directly influence how we feel, think and live — and through the strategic positioning of elements, colors and shapes, it enhances the flow of positive energy, transforming each environment into a catalyst for prosperity and fulfillment.'
      ),
      note: t('Leitura do fluxo energético + orientações práticas', 'Energy flow reading + practical guidance'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre Feng Shui com o Home Harmony.', 'Hello Daniela, I would like to know more about Feng Shui with Home Harmony.')),
    },
    {
      icon: Star,
      title: t('Astrologia do Ki', 'Ki Astrology'),
      partner: 'Cristina Dionísio',
      desc: t(
        'A Astrologia do Ki é uma ferramenta de autoconhecimento que permite compreender padrões pessoais, tendências e dinâmicas relacionais de forma prática e aplicada.',
        'Ki Astrology is a self-knowledge tool that allows understanding personal patterns, tendencies and relational dynamics in a practical and applied way.'
      ),
      detail: t(
        'Através de uma leitura personalizada, são oferecidas orientações simples e integráveis no dia-a-dia, promovendo maior alinhamento entre a essência individual e o espaço habitado. Uma abordagem que une conhecimento ancestral e aplicação prática, ao serviço de uma vida mais consciente e equilibrada.',
        'Through a personalized reading, simple and integrable guidance is offered for daily life, promoting greater alignment between individual essence and the inhabited space. An approach that combines ancestral knowledge and practical application, in service of a more conscious and balanced life.'
      ),
      note: t('Leitura personalizada + orientações para o dia-a-dia', 'Personalized reading + daily guidance'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre Astrologia do Ki com o Home Harmony.', 'Hello Daniela, I would like to know more about Ki Astrology with Home Harmony.')),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }} />
        <div className="absolute inset-0 bg-foreground/75" />

        {/* Back link */}
        <Link
          to="/"
          className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('Voltar', 'Back')}
        </Link>

        <div ref={heroRef} className={`relative z-10 text-center px-4 max-w-3xl mx-auto transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-8 bg-white/5 backdrop-blur-sm">
            <Home className="h-9 w-9 text-gold" strokeWidth={1} />
          </div>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Organização Holística de Espaços', 'Holistic Space Organization')}</p>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extralight text-white tracking-wider mb-6">
            Home Harmony
          </h1>
          <div className="w-12 h-px bg-gold/50 mx-auto" />
        </div>
      </section>

      {/* Home Harmony — Base */}
      <section className="py-24 lg:py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--section-warm) / 0.72) 50%, hsl(var(--section-lilac)) 100%)' }}>
        <div ref={baseRef} className="container mx-auto px-4 lg:px-8 max-w-3xl relative z-10">
          <div className={`transition-all duration-700 ${baseVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center mb-12">
              <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">Home Harmony</p>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extralight text-foreground tracking-wider mb-6">
                {t('Cuidar do Teu Espaço', 'Caring for Your Space')}
              </h2>
              <div className="w-12 h-px bg-gold/40 mx-auto" />
            </div>

            <div className="space-y-5 text-muted-foreground leading-relaxed text-pretty">
              <p>{t(
                'Se o corpo é o Templo onde habitamos, a casa é o espaço que nos acolhe e sustenta no dia-a-dia e um dos locais onde passamos mais tempo, influenciando-nos de forma directa e indirecta.',
                'If the body is the Temple where we dwell, the home is the space that welcomes and sustains us daily and one of the places where we spend the most time, influencing us directly and indirectly.'
              )}</p>
              <p>{t(
                'Idealmente é um local que nos nutre e acolhe, um local seguro, confortável, prático e bonito de acordo com os nossos gostos e necessidades.',
                'Ideally it is a place that nourishes and welcomes us, a safe, comfortable, practical and beautiful place according to our tastes and needs.'
              )}</p>
              <p>{t(
                'Quando a casa está harmoniosa, as várias áreas da nossa vida fluem com mais leveza, alegria, saúde e bem-estar.',
                'When the home is harmonious, various areas of our life flow with more lightness, joy, health and well-being.'
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

            <p className="font-serif italic text-center text-primary/70 mt-10 text-lg tracking-wide">
              {t('"Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!"', '"May your Home be a true Haven that amplifies your Inner Harmony!"')}
            </p>

            <div className="space-y-1 text-sm mt-8 pt-5 border-t border-gold/15 text-center">
              <p className="text-foreground/70 tracking-wide font-light">{t('Duração: a combinar', 'Duration: to be arranged')}</p>
              <p className="font-serif text-lg text-gold tracking-wide">{t('Preço: por consulta', 'Price: by consultation')}</p>
            </div>

            <div className="text-center mt-8">
              <a href={`${WA_BASE}${encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre o Home Harmony.', 'Hello Daniela, I would like to know more about Home Harmony.'))}`} target="_blank" rel="noopener noreferrer">
                <Button className="bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full px-10 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                  <MessageCircle className="h-4 w-4" />
                  {t('Contactar via WhatsApp', 'Contact via WhatsApp')}
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Home Harmony Deluxe */}
      <section className="py-24 lg:py-32 relative overflow-hidden noise-overlay" style={{
        background: 'radial-gradient(circle at 50% 35%, hsl(var(--primary) / 0.18) 0%, transparent 34%), linear-gradient(180deg, hsl(var(--section-lilac-strong)) 0%, hsl(var(--section-lilac)) 55%, hsl(var(--section-warm-soft)) 100%)',
      }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.08] rounded-full blur-3xl pointer-events-none" />

        <div ref={deluxeRef} className="container mx-auto px-4 lg:px-8 relative z-10">
          <div className={`text-center mb-8 transition-all duration-700 ${deluxeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Experiência Completa', 'Complete Experience')}</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extralight text-foreground tracking-wider mb-6 text-balance">
              Home Harmony Deluxe
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-8" />
          </div>

          <div className={`max-w-3xl mx-auto mb-16 transition-all duration-700 delay-200 ${deluxeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="space-y-5 text-muted-foreground leading-relaxed text-pretty text-center">
              <p>{t(
                'Para uma abordagem ainda mais abrangente e integrada, o Home Harmony Deluxe inclui a possibilidade de integrar serviços complementares, realizados em parceria exclusiva com profissionais de confiança de cada área.',
                'For an even more comprehensive and integrated approach, Home Harmony Deluxe includes the possibility of integrating complementary services, carried out in exclusive partnership with trusted professionals in each area.'
              )}</p>
              <p>{t(
                'Esta versão integra não só a organização e harmonização do espaço, como também as dimensões energética e de autoconhecimento.',
                'This version integrates not only the organization and harmonization of the space, but also the energetic and self-knowledge dimensions.'
              )}</p>
              <p className="font-serif italic text-primary/70">{t(
                'Este é um processo pensado para quem deseja uma transformação mais profunda — na casa e na forma como se relaciona com ela.',
                'This is a process designed for those who desire a deeper transformation — in the home and in the way they relate to it.'
              )}</p>
            </div>

            <div className="mt-8 text-center">
              <span className="inline-block text-xs tracking-[0.2em] uppercase text-gold/80 border border-gold/20 px-5 py-2 rounded-full">
                {t('Escolha os complementos que fazem sentido para si', 'Choose the add-ons that make sense for you')}
              </span>
            </div>
          </div>

          {/* Partner cards */}
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
                <div className="absolute inset-0 bg-gradient-to-b from-gold/0 to-gold/[0.05] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <CardContent className="p-8 lg:p-10 flex flex-col h-full relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--primary) / 0.1))',
                    border: '1px solid hsl(var(--gold) / 0.3)',
                  }}>
                    <p.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>

                  <h3 className="font-serif text-xl md:text-2xl font-light text-foreground mb-1 tracking-wider">{p.title}</h3>
                  <p className="text-[10px] tracking-[0.2em] uppercase text-gold/70 mb-5">{t('com', 'with')} {p.partner}</p>

                  <p className="text-muted-foreground text-sm leading-relaxed mb-3 text-pretty">{p.desc}</p>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-5 text-pretty">{p.detail}</p>

                  <p className="text-xs text-foreground/50 italic mt-auto mb-5">{p.note}</p>

                  <a href={`${WA_BASE}${p.wa}`} target="_blank" rel="noopener noreferrer">
                    <Button className="w-full bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                      <MessageCircle className="h-4 w-4" />
                      {t('Saber mais', 'Learn more')}
                    </Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--background)) 100%)' }}>
        <div className="container mx-auto px-4 lg:px-8 text-center relative z-10">
          <p className="font-serif italic text-lg text-primary/60 mb-6 max-w-xl mx-auto">
            {t('"Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!"', '"May your Home be a true Haven that amplifies your Inner Harmony!"')}
          </p>
          <a href={`${WA_BASE}${encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre o Home Harmony Deluxe.', 'Hello Daniela, I would like to know more about Home Harmony Deluxe.'))}`} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full px-12 py-6 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
              <MessageCircle className="h-4 w-4" />
              {t('Contactar via WhatsApp', 'Contact via WhatsApp')}
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomeHarmonyPage;
