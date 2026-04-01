import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const About = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();

  const paragraphs = [
    t(
      'A linguagem do toque, escuta e cuidado do outro, sempre fez parte de mim. Desde cedo, descobri uma conexão natural com a arte de cuidar e uma profunda sensibilidade para compreender as necessidades de cada pessoa.',
      'The language of touch, listening and caring for others has always been a part of me. From an early age, I discovered a natural connection with the art of caring and a deep sensitivity to understand each person\'s needs.'
    ),
    t(
      'Ao longo de 17 anos de prática, formei-me em diversas modalidades terapêuticas: massagem terapêutica, drenagem linfática manual (método Leduc), aromaterapia, terapia de som com taças tibetanas, meditação guiada, técnicas xamânicas, energéticas e de libertação emocional.',
      'Over 17 years of practice, I trained in various therapeutic modalities: therapeutic massage, manual lymphatic drainage (Leduc method), aromatherapy, sound therapy with Tibetan bowls, guided meditation, shamanic, energy and emotional release techniques.'
    ),
    t(
      'Este percurso tem-me proporcionado um olhar mais abrangente da realidade: o olhar científico é uma via externa e o olhar para dentro é uma via interna de conhecimento. Muito do conhecimento que busco sei agora que está também dentro, bastando para isso dar-lhe espaço e boas condições para se revelar.',
      'This journey has given me a broader view of reality: the scientific view is an external path and looking inward is an internal path of knowledge. Much of the knowledge I seek I now know is also within, just needing space and good conditions to reveal itself.'
    ),
    t(
      'A minha filosofia terapêutica assenta na integração corpo-mente-alma. Acredito que o corpo possui uma sabedoria inata para se equilibrar e regenerar — o meu papel é criar as condições ideais para que esse processo aconteça naturalmente. Cada pessoa é única, e cada sessão é uma viagem personalizada, guiada pela intuição e pela experiência.',
      'My therapeutic philosophy is based on body-mind-soul integration. I believe the body has an innate wisdom to balance and regenerate itself — my role is to create the ideal conditions for this process to happen naturally. Each person is unique, and each session is a personalized journey, guided by intuition and experience.'
    ),
    t(
      'Através de uma abordagem integrativa, combino diversas técnicas terapêuticas, incluindo massagem, xamanismo e canto, criando um espaço sagrado onde a transformação acontece naturalmente. O meu espaço em Fontanelas, Sintra, rodeado de natureza, foi pensado para oferecer um refúgio de paz e serenidade — o cenário ideal para o trabalho terapêutico profundo.',
      'Through an integrative approach, I combine various therapeutic techniques, including massage, shamanism and chanting, creating a sacred space where transformation happens naturally. My space in Fontanelas, Sintra, surrounded by nature, was designed to offer a refuge of peace and serenity — the ideal setting for deep therapeutic work.'
    ),
  ];

  return (
    <section id="sobre" className="py-24 lg:py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, hsl(var(--section-warm-soft)) 0%, hsl(var(--section-warm) / 0.72) 45%, hsl(var(--section-lilac)) 100%)' }}>
      {/* Botanical SVG pattern */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23985F97' stroke-width='0.4'/%3E%3Ccircle cx='40' cy='40' r='35' fill='none' stroke='%23985F97' stroke-width='0.3'/%3E%3Cpath d='M40 5 L40 75 M5 40 L75 40' stroke='%23985F97' stroke-width='0.2'/%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
      }} />

      {/* Decorative botanical SVG */}
      <svg className="absolute top-12 left-0 w-40 h-40 text-gold/[0.05] pointer-events-none" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M80 10C80 50 50 80 10 80C50 80 80 110 80 150C80 110 110 80 150 80C110 80 80 50 80 10Z" />
        <circle cx="80" cy="80" r="25" />
      </svg>

      {/* Ambient background layer */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.05]" style={{
        backgroundImage: `url("/images/moi.webp")`,
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
              <div className="absolute -inset-4 border border-gold/15 rounded-t-[140px] rounded-b-3xl" />
              <div className="rounded-t-[120px] rounded-b-2xl overflow-hidden border-2 border-gold/40 shadow-2xl max-w-sm relative z-10">
                <picture>
                  <source
                    type="image/webp"
                    srcSet="/images/moi-400w.webp 400w, /images/moi-800w.webp 800w, /images/moi.webp 1022w"
                    sizes="(max-width: 768px) 100vw, 384px"
                  />
                  <img
                    src="/images/moi.jpg"
                    alt="Daniela Alves - Terapeuta Holística com 17 anos de experiência em Sintra"
                    className="w-full h-auto"
                    width={384}
                    height={512}
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
