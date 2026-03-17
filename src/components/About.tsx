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
      'Este percurso tem-me proporcionado um olhar mais abrangente da realidade: o olhar científico é uma via externa e o olhar para dentro é uma via interna de conhecimento. Muito do conhecimento que busco sei agora que está também dentro, bastando para isso dar-lhe espaço e boas condições para se revelar.',
      'This journey has given me a broader view of reality: the scientific view is an external path and looking inward is an internal path of knowledge. Much of the knowledge I seek I now know is also within, just needing space and good conditions to reveal itself.'
    ),
    t(
      'Através de uma abordagem integrativa, combino diversas técnicas terapêuticas, incluindo massagem, xamanismo e canto, criando um espaço sagrado onde a transformação acontece naturalmente. Em cada sessão, honro o corpo como um templo de sabedoria, permitindo que a cura flua através do toque consciente e da energia amorosa.',
      'Through an integrative approach, I combine various therapeutic techniques, including massage, shamanism and chanting, creating a sacred space where transformation happens naturally. In each session, I honor the body as a temple of wisdom, allowing healing to flow through conscious touch and loving energy.'
    ),
  ];

  return (
    <section id="sobre" className="py-24 lg:py-36 bg-gradient-to-b from-[hsl(40_50%_95%)] via-[hsl(35_45%_96%)] to-[hsl(300_30%_96%)] relative overflow-hidden">
      {/* Botanical SVG pattern — different motif from SpaceHarmony */}
      <div className="absolute inset-0 opacity-[0.025]" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='40' cy='40' r='20' fill='none' stroke='%23985F97' stroke-width='0.4'/%3E%3Ccircle cx='40' cy='40' r='35' fill='none' stroke='%23985F97' stroke-width='0.3'/%3E%3Cpath d='M40 5 L40 75 M5 40 L75 40' stroke='%23985F97' stroke-width='0.2'/%3E%3C/svg%3E")`,
        backgroundSize: '80px 80px',
      }} />

      {/* Decorative botanical SVG */}
      <svg className="absolute top-12 left-0 w-40 h-40 text-gold/[0.05] pointer-events-none" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.5">
        <path d="M80 10C80 50 50 80 10 80C50 80 80 110 80 150C80 110 110 80 150 80C110 80 80 50 80 10Z" />
        <circle cx="80" cy="80" r="25" />
      </svg>

      {/* Ambient landscape background layer */}
      <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-[0.05]" style={{
        backgroundImage: `url("https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/Moi-optimized.jpg")`,
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
          </div>

          {/* Photo with artistic double frame */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              {/* Outer transparent gap frame */}
              <div className="absolute -inset-4 border border-gold/15 rounded-t-[140px] rounded-b-3xl" />
              {/* Inner image with gold border */}
              <div className="rounded-t-[120px] rounded-b-2xl overflow-hidden border-2 border-gold/40 shadow-2xl max-w-sm relative z-10">
                <img
                  src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/Moi-optimized.jpg"
                  alt="Daniela Alves"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
              {/* Decorative botanical element */}
              <svg className="absolute -bottom-8 -right-8 w-24 h-24 text-gold/10 z-0" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="0.5">
                <path d="M50 5C50 30 30 50 5 50C30 50 50 70 50 95C50 70 70 50 95 50C70 50 50 30 50 5Z" />
                <circle cx="50" cy="50" r="15" />
              </svg>
              {/* Gold glow behind photo */}
              <div className="absolute -inset-8 bg-gold/[0.04] rounded-full blur-3xl -z-10" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
