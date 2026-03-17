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
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { href: '#servicos', label: t('Cuidar de Ti', 'Caring for You') },
    { href: '#espaco', label: t('Teu Espaço', 'Your Space') },
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
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass shadow-sm border-b border-border/30' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto flex items-center justify-between px-4 py-3 lg:px-8">
          {/* Logo */}
          <a href="#" className="flex items-center gap-3" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img
              src="https://raw.githubusercontent.com/bilalmachraa82/Daniela-Healing/master/images/logo.png"
              alt="Daniela Alves Healing & Wellness"
              className="h-10 w-auto"
              loading="eager"
            />
            <div className="hidden sm:block">
              <span className="font-serif text-lg font-light tracking-wider text-primary">Daniela Alves</span>
              <span className="block text-[10px] tracking-[0.2em] uppercase text-muted-foreground">Healing & Wellness</span>
            </div>
          </a>

          {/* Desktop links */}
          <div className="hidden lg:flex items-center gap-6">
            {links.map(l => (
              <button
                key={l.href}
                onClick={() => scrollTo(l.href)}
                className="text-sm font-medium text-foreground/80 hover:text-primary transition-colors tracking-wide"
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
              className="relative flex items-center rounded-full border border-border bg-muted p-0.5 text-xs font-medium"
              aria-label="Toggle language"
            >
              <span className={`px-2 py-1 rounded-full transition-all ${lang === 'pt' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>PT</span>
              <span className={`px-2 py-1 rounded-full transition-all ${lang === 'en' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>EN</span>
            </button>

            {/* CTA */}
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="hidden md:block">
              <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full text-xs">
                <MessageCircle className="h-3.5 w-3.5" />
                {t('Marque a sua Sessão', 'Book a Session')}
              </Button>
            </a>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 text-foreground"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-background/95 backdrop-blur-lg flex flex-col items-center justify-center gap-8 animate-fade-in-up">
          {links.map(l => (
            <button
              key={l.href}
              onClick={() => scrollTo(l.href)}
              className="font-serif text-2xl font-light text-foreground hover:text-primary transition-colors tracking-wider"
            >
              {l.label}
            </button>
          ))}
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2 rounded-full mt-4">
              <MessageCircle className="h-4 w-4" />
              {t('Marque a sua Sessão', 'Book a Session')}
            </Button>
          </a>
        </div>
      )}
    </>
  );
};

export default Navigation;
