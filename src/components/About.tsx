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
    <section id="sobre" className="py-20 lg:py-28 bg-background">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={`grid md:grid-cols-2 gap-10 lg:gap-16 items-center transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Text */}
          <div className="order-2 md:order-1">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-primary tracking-wider mb-8">
              {t('Sobre Mim', 'About Me')}
            </h2>
            <div className="space-y-5">
              {paragraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed text-sm md:text-base">{p}</p>
              ))}
            </div>
          </div>

          {/* Photo */}
          <div className="order-1 md:order-2 flex justify-center">
            <div className="relative">
              <div className="rounded-t-[120px] rounded-b-2xl overflow-hidden border-2 border-secondary/40 shadow-xl max-w-sm">
                <img
                  src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/Moi-optimized.jpg"
                  alt="Daniela Alves"
                  className="w-full h-auto"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
