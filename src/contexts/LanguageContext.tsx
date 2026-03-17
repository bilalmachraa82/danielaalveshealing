import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

type Lang = 'pt' | 'en';

interface LanguageContextType {
  lang: Lang;
  toggleLang: () => void;
  t: (pt: string, en: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('lang');
    return (saved === 'en' ? 'en' : 'pt') as Lang;
  });

  useEffect(() => {
    localStorage.setItem('lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => prev === 'pt' ? 'en' : 'pt');
  }, []);

  const t = useCallback((pt: string, en: string) => lang === 'pt' ? pt : en, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
