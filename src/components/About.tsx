import { useLanguage } from '@/contexts/LanguageContext';
import { useTherapist } from '@/lib/config/therapist-context';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const About = () => {
  const { t } = useLanguage();
  const config = useTherapist();
  const primaryEncoded = encodeURIComponent(config.colors.primary);
  const { ref, isVisible } = useScrollAnimation();

  const paragraphs = [
    t(
      'Estudei Engenharia do Ambiente e o encontro com o yoga e a meditação fizeram-me alterar o meu rumo e transformar a minha vida!',
      'I studied Environmental Engineering, and my encounter with yoga and meditation led me to change my path and transform my life!'
    ),
    t(
      'A linguagem do toque, escuta e cuidado do outro sempre fizeram parte da minha forma de ser, pelo que, com naturalidade, iniciei o estudo de massagem.',
      'The language of touch, listening and caring for others has always been part of who I am, so I naturally began studying massage.'
    ),
    t(
      'Ao longo de mais de 17 anos, fui aprofundando o estudo do ser humano — através do toque, do som, do trabalho energético, do desenvolvimento pessoal, da aromaterapia, da kinesiologia holística e de outras abordagens terapêuticas.',
      'Over more than 17 years, I have deepened my study of the human being — through touch, sound, energy work, personal development, aromatherapy, holistic kinesiology and other therapeutic approaches.'
    ),
    t(
      'Hoje, integro esse percurso numa prática integrativa e intuitiva que vai além da técnica, criando experiências terapêuticas profundas e personalizadas.',
      'Today, I integrate this journey into an integrative and intuitive practice that goes beyond technique, creating deep and personalized therapeutic experiences.'
    ),
    t(
      'Procuro proporcionar uma ampliação da Consciência e uma saúde e bem-estar nos vários níveis: físico, mental, emocional e espiritual.',
      'I seek to provide an expansion of Consciousness and health and well-being on various levels: physical, mental, emotional and spiritual.'
    ),
    t(
      'Através de sessões individuais ou em grupo, produtos naturais, harmonização de espaços e experiências imersivas, sustento processos de transformação e harmonização.',
      'Through individual or group sessions, natural products, space harmonization and immersive experiences, I support processes of transformation and harmonization.'
    ),
    t(
      'Acredito que estamos interligados e que quanto mais Consciência, Amor e Harmonia experienciamos tanto maior é a nossa contribuição para um mundo mais leve, compassivo e amoroso.',
      'I believe we are all interconnected, and that the more Consciousness, Love and Harmony we experience, the greater our contribution to a lighter, more compassionate and loving world.'
    ),
  ];

  return (
    <section id="sobre" className="py-24 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--section-warm) / 0.72) 45%, hsl(var(--section-lilac)) 100%)' }}>
      {/* Botanical SVG pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='${primaryEncoded}' stroke-width='0.4'/%3E%3Ccircle cx='40' cy='40' r='35' fill='none' stroke='${primaryEncoded}' stroke-width='0.3'/%3E%3Cpath d='M40 5 L40 75 M5 40 L75 40' stroke='${primaryEncoded}' stroke-width='0.2'/%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
      }} />

      {/* Decorative botanical SVG */}
      <svg className="absolute top-12 left-0 w-40 h-40 text-gold/[0.05] pointer-events-none" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M80 10C80 50 50 80 10 80C50 80 80 110 80 150C80 110 110 80 150 80C110 80 80 50 80 10Z" />
        <circle cx="80" cy="80" r="25" />
      </svg>

      {/* Ambient background layer */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.05]" style={{
        backgroundImage: `url("/images/daniela-portrait.webp")`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        filter: 'blur(30px) saturate(0.2)',
      }} />

      <div ref={ref} className="container mx-auto px-4 lg:px-8 relative z-10">
        <div className={`grid md:grid-cols-2 gap-12 lg:gap-20 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Text */}
          <div className="order-2 md:order-1">
            <p className="text-[11px] tracking-[0.3em] uppercase text-gold mb-4">{t('A Terapeuta', 'The Therapist')}</p>
            <h2 className="font-serif text-4xl md:text-5xl lg:text-6xl font-extralight text-foreground tracking-wider mb-10 text-balance">
              {t('Sobre Mim', 'About Me')}
            </h2>
            <div className="space-y-6">
              {paragraphs.map((p, i) => (
                <p
                  key={i}
                  className={`text-muted-foreground leading-relaxed text-sm md:text-base text-pretty ${i === 0 ? 'drop-cap' : ''} transition-all duration-700`}
                  style={{ transitionDelay: isVisible ? `${(i + 1) * 150}ms` : '0ms' }}
                >
                  {p}
                </p>
              ))}
            </div>

            {/* Handwritten signature SVG */}
            <div className="mt-10 flex items-center gap-4">
              <div className="h-px flex-1 bg-gradient-to-r from-gold/30 to-transparent" />
              <svg viewBox="0 0 120 40" className="w-28 h-10 text-gold/40" fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M10 20 Q30 5 60 20 Q90 35 110 20" />
                <path d="M20 20 Q40 10 60 20 Q80 30 100 20" />
                <circle cx="60" cy="20" r="3" fill="currentColor" opacity="0.3" />
                <path d="M50 20 L55 15 M70 20 L65 15 M50 20 L55 25 M70 20 L65 25" />
              </svg>
              <div className="h-px flex-1 bg-gradient-to-l from-gold/30 to-transparent" />
            </div>
            <p className="text-center text-[10px] tracking-[0.3em] uppercase text-muted-foreground/50 mt-3">Daniela Alves</p>
          </div>

          {/* Photo with artistic double frame */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="absolute -inset-4 border border-gold/15 rounded-t-[100px] rounded-b-3xl" />
              <div className="rounded-t-[80px] rounded-b-2xl overflow-hidden border-2 border-gold/40 shadow-2xl max-w-sm relative z-10">
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/images/daniela-portrait-400w.webp 400w, /images/daniela-portrait-800w.webp 800w, /images/daniela-portrait.webp 1024w"
                    sizes="(max-width: 768px) 100vw, 384px"
                  />
                  <img
                    src="/images/daniela-portrait.jpg"
                    alt="Daniela Alves - Terapeuta Holística com 17 anos de experiência, à entrada do espaço terapêutico em Fontanelas, Sintra"
                    className="w-full h-auto"
                    width={384}
                    height={576}
                    loading="lazy"
                  />
                </picture>
              </div>
              <svg className="absolute -bottom-8 -right-8 w-24 h-24 text-gold/10 z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M50 5C50 30 30 50 5 50C30 50 50 70 50 95C50 70 70 50 95 50C70 50 50 30 50 5Z" />
                <circle cx="50" cy="50" r="15" />
              </svg>
              <div className="absolute -inset-8 bg-gold/[0.04] rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
