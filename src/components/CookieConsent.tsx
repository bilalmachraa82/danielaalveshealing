import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

const CookieConsent = () => {
  const { t } = useLanguage();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const choice = localStorage.getItem('cookie-consent');
    if (!choice) {
      const timer = setTimeout(() => setVisible(true), 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted');
    setVisible(false);
  };

  const reject = () => {
    localStorage.setItem('cookie-consent', 'rejected');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-fade-in-up">
      <div className="container mx-auto max-w-3xl glass rounded-xl border border-border/50 p-4 flex flex-col sm:flex-row items-center gap-4 shadow-xl">
        <p className="text-sm text-muted-foreground flex-grow">
          {t(
            'Este site utiliza cookies para melhorar a sua experiência de navegação.',
            'This site uses cookies to improve your browsing experience.'
          )}
        </p>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" onClick={accept} className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full text-xs px-5">
            {t('Aceitar', 'Accept')}
          </Button>
          <Button size="sm" variant="ghost" onClick={reject} className="rounded-full text-xs px-5">
            {t('Recusar', 'Decline')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
