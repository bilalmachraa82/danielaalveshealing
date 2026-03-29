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
  const { ref: introRef, isVisible: introVisible } = useScrollAnimation();
  const { ref: bodyRef, isVisible: bodyVisible } = useScrollAnimation();
  const { ref: processRef, isVisible: processVisible } = useScrollAnimation();
  const { ref: deluxeRef, isVisible: deluxeVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation();

  const partners = [
    {
      icon: Sparkles,
      title: t('Limpeza Energética', 'Energy Cleansing'),
      partner: 'Bilal Machraa',
      desc: t(
        'Uma abordagem subtil e poderosa, que atua ao nível energético do espaço.',
        'A subtle and powerful approach that works at the energetic level of the space.'
      ),
      detail: t(
        'Facilita a libertação de memórias, energias estagnadas e padrões invisíveis que possam estar a bloquear o bem-estar, devolvendo ao espaço a sua frequência natural.',
        'Facilitates the release of memories, stagnant energies and invisible patterns that may be blocking well-being, returning the space to its natural frequency.'
      ),
      note: t('Presencial ou à distância', 'In-person or remote'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre a Limpeza Energética com o Home Harmony.', 'Hello Daniela, I would like to know more about Energy Cleansing with Home Harmony.')),
    },
    {
      icon: Compass,
      title: 'Feng Shui',
      partner: 'Cristina Dionísio',
      desc: t(
        'Abordagem milenar que harmoniza os espaços para apoiar o bem-estar e a prosperidade em todas as áreas da vida.',
        'Ancient approach that harmonizes spaces to support well-being and prosperity in all areas of life.'
      ),
      detail: t(
        'Através do posicionamento estratégico de elementos, cores e formas, potencializa o fluxo de energia positiva, transformando cada ambiente num catalisador de realização.',
        'Through strategic positioning of elements, colors and shapes, it enhances positive energy flow, transforming each environment into a catalyst for fulfillment.'
      ),
      note: t('Leitura energética + orientações práticas', 'Energy reading + practical guidance'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre Feng Shui com o Home Harmony.', 'Hello Daniela, I would like to know more about Feng Shui with Home Harmony.')),
    },
    {
      icon: Star,
      title: t('Astrologia do Ki', 'Ki Astrology'),
      partner: 'Cristina Dionísio',
      desc: t(
        'Ferramenta de autoconhecimento que permite compreender padrões pessoais e dinâmicas relacionais de forma prática.',
        'Self-knowledge tool for understanding personal patterns and relational dynamics in a practical way.'
      ),
      detail: t(
        'Orientações simples e integráveis no dia-a-dia, promovendo maior alinhamento entre a essência individual e o espaço habitado.',
        'Simple guidance for daily life, promoting greater alignment between individual essence and the inhabited space.'
      ),
      note: t('Leitura personalizada + orientações', 'Personalized reading + guidance'),
      wa: encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre Astrologia do Ki com o Home Harmony.', 'Hello Daniela, I would like to know more about Ki Astrology with Home Harmony.')),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* ─── Hero — Warm interior, directional gradient ─── */}
      <section className="relative min-h-[75vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&q=80")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
        }} />
        <div className="absolute inset-0 bg-gradient-to-b from-foreground/55 via-foreground/65 to-foreground/85" />

        <Link to="/" className="absolute top-6 left-6 z-20 inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
          <ArrowLeft className="h-4 w-4" />
          {t('Voltar', 'Back')}
        </Link>

        <div ref={heroRef} className={`relative z-10 text-center px-4 max-w-3xl mx-auto transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">{t('Organização Holística de Espaços', 'Holistic Space Organization')}</p>
          <div className="w-20 h-20 rounded-full border border-gold/30 flex items-center justify-center mx-auto mb-8 bg-white/5 backdrop-blur-sm">
            <Home className="h-9 w-9 text-gold" strokeWidth={1} />
          </div>
          <h1 className="font-serif text-5xl md:text-6xl lg:text-7xl font-extralight text-white tracking-wider mb-10">
            Home Harmony
          </h1>
          <div className="w-12 h-px bg-gold/50 mx-auto mb-10" />
          <p className="font-serif text-xl md:text-2xl text-white/65 italic max-w-xl mx-auto leading-relaxed">
            {t(
              '"Que a sua Casa seja um verdadeiro Lar que amplia a sua Harmonia Interior!"',
              '"May your Home be a true Haven that amplifies your Inner Harmony!"'
            )}
          </p>
        </div>
      </section>

      {/* ─── Editorial Opening — Pull quote ─── */}
      <section className="py-32 lg:py-40 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--section-warm) / 0.72) 50%, hsl(var(--section-lilac)) 100%)' }}>
        <svg className="absolute top-16 right-0 w-40 h-40 text-gold/[0.04] pointer-events-none" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.5">
          <path d="M80 10C80 50 50 80 10 80C50 80 80 110 80 150C80 110 110 80 150 80C110 80 80 50 80 10Z" />
          <circle cx="80" cy="80" r="25" />
        </svg>

        <div className="container mx-auto px-4 lg:px-8 max-w-5xl relative z-10">
          {/* Pull quote — large editorial opening */}
          <div ref={introRef} className={`text-center mb-32 transition-all duration-700 ${introVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-6">Home Harmony</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extralight text-foreground tracking-wider mb-10">
              {t('Cuidar do Teu Espaço', 'Caring for Your Space')}
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-14" />

            <div className="relative max-w-2xl mx-auto">
              <span className="absolute -top-8 -left-4 font-serif text-7xl text-gold/15 select-none leading-none">"</span>
              <p className="font-serif text-2xl md:text-3xl font-extralight text-foreground/80 leading-[1.6] px-6">
                {t(
                  'Se o corpo é o Templo onde habitamos, a casa é o espaço que nos acolhe e sustenta no dia-a-dia.',
                  'If the body is the Temple where we dwell, the home is the space that welcomes and sustains us daily.'
                )}
              </p>
              <span className="absolute -bottom-8 -right-4 font-serif text-7xl text-gold/15 select-none leading-none">"</span>
            </div>
          </div>

          {/* Full-bleed image band — editorial breath */}
          <div className="w-screen relative left-1/2 -translate-x-1/2 h-[120px] md:h-[160px] mb-32 overflow-hidden">
            <div className="absolute inset-0" style={{
              backgroundImage: `url("https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80")`,
              backgroundSize: 'cover',
              backgroundPosition: 'center 55%',
            }} />
          </div>

          {/* Philosophy — editorial two-column */}
          <div ref={bodyRef} className={`transition-all duration-700 ${bodyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="grid md:grid-cols-2 gap-x-20 lg:gap-x-24 gap-y-10 mb-20">
              <div className="space-y-7">
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'Idealmente, a casa é um local que nos nutre e acolhe — ',
                    'Ideally, the home is a place that nourishes and welcomes us — '
                  )}
                  <strong className="text-foreground font-medium">{t('seguro, confortável, prático e bonito', 'safe, comfortable, practical and beautiful')}</strong>
                  {t(
                    ', de acordo com os nossos gostos e necessidades.',
                    ', according to our tastes and needs.'
                  )}
                </p>
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'Quando a casa está harmoniosa, as várias áreas da nossa vida fluem com mais ',
                    'When the home is harmonious, various areas of our life flow with more '
                  )}
                  <strong className="text-foreground font-medium">{t('leveza, alegria, saúde e bem-estar', 'lightness, joy, health and well-being')}</strong>.
                </p>
              </div>

              <div className="space-y-7">
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'O Home Harmony é um serviço de organização holística que apoia a ',
                    'Home Harmony is a holistic organization service that supports the '
                  )}
                  <strong className="text-foreground font-medium">{t('transformação do seu espaço', 'transformation of your space')}</strong>
                  {t(
                    ' de forma consciente, prática e alinhada consigo.',
                    ' in a conscious, practical and aligned way.'
                  )}
                </p>
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'Mais do que organizar, este trabalho propõe uma ',
                    'More than organizing, this work proposes an '
                  )}
                  <strong className="text-foreground font-medium">{t('abordagem integrada entre pessoa e espaço', 'integrated approach between person and space')}</strong>
                  {t(
                    ' — onde não só se cria ordem e funcionalidade, mas também uma relação mais harmoniosa com a casa.',
                    ' — where not only order and functionality are created, but also a more harmonious relationship with the home.'
                  )}
                </p>
              </div>
            </div>

            {/* Gold divider */}
            <div className="flex items-center gap-4 max-w-xs mx-auto mb-20">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
              <span className="text-gold/30 text-lg">✦</span>
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
            </div>
          </div>

          {/* Process — left gold rule, editorial */}
          <div ref={processRef} className={`transition-all duration-700 ${processVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="max-w-2xl mx-auto">
              <h3 className="font-serif text-2xl md:text-3xl font-extralight text-foreground tracking-wider mb-10 text-center">
                {t('O Processo', 'The Process')}
              </h3>

              <div className="border-l-2 border-gold/25 pl-8 md:pl-12 space-y-6">
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'Com base numa leitura do momento e das suas necessidades, vamos ajustando o espaço de forma ',
                    'Based on a reading of the moment and your needs, we adjust the space '
                  )}
                  <strong className="text-foreground font-medium">{t('intuitiva e personalizada', 'intuitively and personally')}</strong>
                  {t(
                    ', respeitando o seu ritmo, os seus gostos e a realidade do seu dia-a-dia.',
                    ', respecting your rhythm, your tastes and the reality of your daily life.'
                  )}
                </p>
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'Sem rigidez ou perfeccionismo — não se trata de criar uma casa "perfeita", mas um ',
                    'Without rigidity or perfectionism — it is not about creating a "perfect" home, but a '
                  )}
                  <strong className="text-foreground font-medium">{t('espaço vivo, acolhedor e funcional', 'living, welcoming and functional space')}</strong>
                  {t(
                    ', que o(a) apoie e reflita.',
                    ' that supports and reflects you.'
                  )}
                </p>
                <p className="text-foreground/80 text-[17px] leading-[1.85]">
                  {t(
                    'Este processo decorre geralmente ao longo de ',
                    'This process generally takes place over '
                  )}
                  <strong className="text-foreground font-medium">{t('várias visitas', 'several visits')}</strong>
                  {t(
                    ', permitindo uma transformação progressiva, sustentável e integrada, com atenção ao uso de materiais e soluções mais naturais e saudáveis.',
                    ', allowing for a progressive, sustainable and integrated transformation, with attention to the use of more natural and healthy materials and solutions.'
                  )}
                </p>
              </div>

              {/* Pricing — premium bordered block */}
              <div className="border border-gold/15 rounded-2xl py-8 px-10 mt-14 text-center">
                <p className="font-serif italic text-foreground/60 text-base mb-6">
                  {t('Um processo personalizado, construído ao seu ritmo.', 'A personalized process, built at your pace.')}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{t('Duração', 'Duration')}</p>
                    <p className="font-serif text-lg text-foreground tracking-wide">{t('A combinar', 'To be arranged')}</p>
                  </div>
                  <div className="hidden sm:block w-px h-10 bg-gold/20" />
                  <div className="text-center">
                    <p className="text-[10px] tracking-[0.2em] uppercase text-muted-foreground mb-1">{t('Investimento', 'Investment')}</p>
                    <p className="font-serif text-lg text-gold tracking-wide">{t('Por consulta', 'By consultation')}</p>
                  </div>
                </div>
              </div>

              <div className="text-center mt-10">
                <a href={`${WA_BASE}${encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre o Home Harmony.', 'Hello Daniela, I would like to know more about Home Harmony.'))}`} target="_blank" rel="noopener noreferrer">
                  <Button className="bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full px-10 text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                    <MessageCircle className="h-4 w-4" />
                    {t('Contactar via WhatsApp', 'Contact via WhatsApp')}
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Home Harmony Deluxe ─── */}
      <section className="py-32 lg:py-40 relative overflow-hidden noise-overlay" style={{
        background: 'radial-gradient(circle at 50% 35%, hsl(var(--primary) / 0.18) 0%, transparent 34%), linear-gradient(180deg, hsl(var(--section-lilac-strong)) 0%, hsl(var(--section-lilac)) 55%, hsl(var(--section-warm-soft)) 100%)',
      }}>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/[0.08] rounded-full blur-3xl pointer-events-none" />

        {/* Subtle interior accent behind heading */}
        <div className="absolute top-0 left-0 right-0 h-[300px] opacity-[0.04]" style={{
          backgroundImage: `url("https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&q=60")`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          maskImage: 'linear-gradient(to bottom, black, transparent)',
          WebkitMaskImage: 'linear-gradient(to bottom, black, transparent)',
        }} />

        <div ref={deluxeRef} className="container mx-auto px-4 lg:px-8 relative z-10">
          {/* Gold diamond ornament */}
          <div className="flex items-center gap-4 max-w-xs mx-auto mb-10">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/25" />
            <span className="text-gold/40 text-sm">✦</span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/25" />
          </div>

          <div className={`text-center mb-8 transition-all duration-700 ${deluxeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('Experiência Completa', 'Complete Experience')}</p>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-extralight text-foreground tracking-[0.04em] mb-6 text-balance">
              Home Harmony <span className="text-gold">Deluxe</span>
            </h2>
            <div className="w-12 h-px bg-gold/40 mx-auto mb-12" />
          </div>

          <div className={`max-w-2xl mx-auto mb-20 transition-all duration-700 delay-200 ${deluxeVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="text-center space-y-6">
              <p className="text-foreground/80 text-[17px] leading-[1.85]">
                {t(
                  'Para uma abordagem ainda mais abrangente, o Home Harmony Deluxe integra ',
                  'For an even more comprehensive approach, Home Harmony Deluxe integrates '
                )}
                <strong className="text-foreground font-medium">{t('serviços complementares', 'complementary services')}</strong>
                {t(
                  ', realizados em parceria exclusiva com profissionais de confiança.',
                  ', carried out in exclusive partnership with trusted professionals.'
                )}
              </p>
              <p className="text-foreground/80 text-[17px] leading-[1.85]">
                {t(
                  'Esta versão integra não só a organização e harmonização do espaço, como também as ',
                  'This version integrates not only space organization and harmonization, but also the '
                )}
                <strong className="text-foreground font-medium">{t('dimensões energética e de autoconhecimento', 'energetic and self-knowledge dimensions')}</strong>.
              </p>
              <p className="font-serif italic text-xl md:text-2xl text-foreground/65 mt-4 leading-relaxed">
                {t(
                  'Um processo pensado para quem deseja uma transformação mais profunda — na casa e na forma como se relaciona com ela.',
                  'A process designed for those who desire a deeper transformation — in the home and in the way they relate to it.'
                )}
              </p>
            </div>

            <div className="mt-12 text-center">
              <span className="inline-block text-sm tracking-[0.15em] uppercase text-gold border border-gold/25 px-6 py-2.5 rounded-full bg-gold/[0.03]">
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

                <CardContent className="p-10 lg:p-12 flex flex-col h-full relative">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center mb-6 transition-all duration-500 group-hover:scale-110" style={{
                    background: 'linear-gradient(135deg, hsl(var(--gold) / 0.15), hsl(var(--primary) / 0.1))',
                    border: '1px solid hsl(var(--gold) / 0.3)',
                  }}>
                    <p.icon className="h-6 w-6 text-gold" strokeWidth={1.5} />
                  </div>

                  <h3 className="font-serif text-xl md:text-2xl font-light text-foreground mb-1 tracking-[0.04em]">{p.title}</h3>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-gold/70 mb-6">{t('com', 'with')} {p.partner}</p>

                  <p className="text-foreground/75 text-[17px] leading-[1.85] mb-3 text-pretty">{p.desc}</p>
                  <p className="text-foreground/75 text-[17px] leading-[1.85] mb-6 text-pretty">{p.detail}</p>

                  <div className="mt-auto space-y-5">
                    <p className="text-sm text-gold/60 italic">{p.note}</p>
                    <a href={`${WA_BASE}${p.wa}`} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full text-xs tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                        <MessageCircle className="h-4 w-4" />
                        {t('Saber mais', 'Learn more')}
                      </Button>
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA Final ─── */}
      <section className="py-32 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--background)) 100%)' }}>
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
            <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-12">— Daniela Alves</p>
            <a href={`${WA_BASE}${encodeURIComponent(t('Olá Daniela, gostaria de saber mais sobre o Home Harmony.', 'Hello Daniela, I would like to know more about Home Harmony.'))}`} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="bg-foreground hover:bg-foreground/90 text-background gap-2.5 rounded-full px-12 py-6 text-sm tracking-[0.15em] uppercase font-light transition-all duration-300 hover:shadow-lg">
                <MessageCircle className="h-4 w-4" />
                {t('Marcar Consulta', 'Book Consultation')}
              </Button>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomeHarmonyPage;
