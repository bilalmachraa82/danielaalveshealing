import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import Services from '@/components/Services';
import SpaceHarmony from '@/components/SpaceHarmony';
import GiftVoucher from '@/components/GiftVoucher';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CookieConsent from '@/components/CookieConsent';
import SectionDivider from '@/components/SectionDivider';

const Index = () => (
  <>
    <Navigation />
    <main>
      <Hero />
      <TrustStrip />
      <SectionDivider fromColor="hsl(var(--background))" toColor="hsl(var(--mist))" />
      <Services />
      <SectionDivider fromColor="hsl(var(--cream))" toColor="hsl(276, 8%, 17%)" />
      <SpaceHarmony />
      <SectionDivider fromColor="hsl(276, 8%, 17%)" toColor="hsl(var(--cream))" flip />
      <GiftVoucher />
      <SectionDivider fromColor="hsl(var(--background))" toColor="hsl(var(--cream))" />
      <About />
      <SectionDivider fromColor="hsl(var(--mist))" toColor="hsl(var(--mist))" />
      <Testimonials />
      <SectionDivider fromColor="hsl(var(--mist))" toColor="hsl(var(--background))" flip />
      <FAQ />
    </main>
    <Footer />
    <WhatsAppFloat />
    <CookieConsent />
  </>
);

export default Index;
