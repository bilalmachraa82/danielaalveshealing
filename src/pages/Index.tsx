import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import TrustStrip from '@/components/TrustStrip';
import Services from '@/components/Services';
import SpaceHarmony from '@/components/SpaceHarmony';
import GiftVoucher from '@/components/GiftVoucher';
import About from '@/components/About';
import Testimonials from '@/components/Testimonials';
import FAQ from '@/components/FAQ';
import CTABanner from '@/components/CTABanner';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import CookieConsent from '@/components/CookieConsent';
import LoadingScreen from '@/components/LoadingScreen';

const Index = () => (
  <>
    <LoadingScreen />
    <Navigation />
    <main>
      <Hero />
      <TrustStrip />
      <Services />
      <SpaceHarmony />
      <GiftVoucher />
      <About />
      <Testimonials />
      <FAQ />
      <CTABanner />
    </main>
    <Footer />
    <WhatsAppFloat />
    <CookieConsent />
  </>
);

export default Index;
