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
    <section id="sobre" className="py-24 lg:py-36 bg-background">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
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
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
