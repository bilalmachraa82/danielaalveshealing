import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Home, MessageCircle } from 'lucide-react';

const WA_LINK = 'https://wa.me/351914173445?text=' + encodeURIComponent('Olá Daniela, gostaria de saber mais sobre o serviço Home Harmony.');

const SpaceHarmony = () => {
  const { t } = useLanguage();
  const { ref, isVisible } = useScrollAnimation();
  const [open, setOpen] = useState(false);

  return (
    <section id="espaco" className="py-20 lg:py-28 bg-cream">
      <div ref={ref} className="container mx-auto px-4 lg:px-8">
        <div className={`text-center mb-14 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-light text-primary tracking-wider mb-4">
            {t('Cuidar do Teu Espaço', 'Caring for Your Space')}
          </h2>
        </div>

        <Card className={`max-w-2xl mx-auto bg-card border-border/50 hover:shadow-xl transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <CardContent className="p-10 text-center">
            <div className="w-20 h-20 rounded-full bg-secondary/15 flex items-center justify-center mx-auto mb-6">
              <Home className="h-9 w-9 text-secondary" />
            </div>
            <h3 className="font-serif text-2xl md:text-3xl font-light text-foreground mb-4 tracking-wide">Home Harmony</h3>
            <p className="text-muted-foreground leading-relaxed mb-8">
              {t(
                'Harmonização de ambientes para criar espaços de paz e energia positiva.',
                'Space harmonization to create environments of peace and positive energy.'
              )}
            </p>
            <Button
              variant="outline"
              className="rounded-full border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground"
              onClick={() => setOpen(true)}
            >
              {t('Saber mais', 'Learn more')}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="font-serif text-2xl font-light text-primary tracking-wide">Home Harmony</DialogTitle>
            <DialogDescription className="sr-only">Home Harmony</DialogDescription>
          </DialogHeader>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {t(
              'Uma visão holística do espaço, harmonização energética, organização intuitiva e uma abordagem sustentável para transformar a sua casa num santuário de paz e bem-estar.',
              'A holistic vision of space, energy harmonization, intuitive organization and a sustainable approach to transform your home into a sanctuary of peace and well-being.'
            )}
          </p>
          <a href={WA_LINK} target="_blank" rel="noopener noreferrer" className="mt-4 block">
            <Button className="w-full bg-whatsapp hover:bg-whatsapp/90 text-whatsapp-foreground gap-2 rounded-full">
              <MessageCircle className="h-4 w-4" />
              {t('Contactar via WhatsApp', 'Contact via WhatsApp')}
            </Button>
          </a>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default SpaceHarmony;
