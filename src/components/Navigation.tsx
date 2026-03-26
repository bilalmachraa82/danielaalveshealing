import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Menu, X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

const WA_LINK = 'https://wa.me/351914173445?text=Olá%20Daniela%2C%20gostaria%20de%20saber%20mais%20sobre%20os%20seus%20serviços.';

const Navigation = () => {
  const { lang, toggleLang, t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#servicos', label: t('Cuidar de Ti', 'Caring for You') },
    { href: '#espaco', label: t('Cuidar do Teu Espaço', 'Caring for Your Space') },
    { href: '#sobre', label: t('Sobre Mim', 'About Me') },
    { href: '#testemunhos', label: t('Testemunhos', 'Testimonials') },
    { href: '#contacto', label: t('Contacto', 'Contact') },
  ];

  const scrollTo = (href: string) => {
    setMobileOpen(false);
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-background/80 backdrop-blur-xl shadow-sm border-b border-border/20 py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/logo.png"
              alt="Daniela Alves Healing & Wellness"
              className={`h-10 w-auto transition-all duration-300 ${scrolled ? '' : 'brightness-0 invert'}`}
              loading="eager"
            />
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-8">
            {links.map(l => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className={`text-xs font-medium tracking-[0.12em] uppercase gold-underline transition-colors duration-300 ${
                  scrolled ? 'text-foreground/70 hover:text-foreground' : 'text-white/80 hover:text-white'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Lang toggle */}
            <button
              onClick={toggleLang}
              className={`relative flex items-center rounded-full p-0.5 text-[10px] font-medium tracking-wider transition-all duration-300 ${
                scrolled ? 'border border-border bg-muted' : 'border border-white/20 bg-white/10'
              }`}
              aria-label="Toggle language"
            >
              <span className={`px-2 py-1 rounded-full transition-all ${
                lang === 'pt'
                  ? 'bg-primary text-primary-foreground'
                  : scrolled ? 'text-muted-foreground' : 'text-white/60'
              }`}>PT</span>
              <span className={`px-2 py-1 rounded-full transition-all ${
                lang === 'en'
                  ? 'bg-primary text-primary-foreground'
                  : scrolled ? 'text-muted-foreground' : 'text-white/60'
              }`}>EN</span>
            </button>

            {/* CTA */}
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <Button
                size="sm"
                className="gap-2 rounded-full text-[10px] tracking-wider uppercase transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <MessageCircle className="h-3 w-3" />
                {t('Marcar Sessão', 'Book Session')}
              </Button>
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className={`lg:hidden p-2 transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/95 backdrop-blur-xl flex flex-col items-center justify-center gap-8 animate-fade-in-up">
          {links.map(l => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="font-serif text-2xl font-extralight text-white/90 hover:text-gold tracking-[0.15em] transition-colors"
            >
              {l.label}
            </button>
          ))}
          <div className="section-divider my-2" />
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full mt-2">
              <MessageCircle className="h-4 w-4" />
              {t('Marcar Sessão', 'Book Session')}
            </Button>
          </a>
        </div>
      )}
    </>
  );
};

export default Navigation;
