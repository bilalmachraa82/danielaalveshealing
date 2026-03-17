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
import SectionFade from '@/components/SectionFade';

const Index = () => (
  <>
    <LoadingScreen />
    <Navigation />
    <main>
      <Hero />
      <TrustStrip />

      {/* TrustStrip (dark) → Services (lilac-strong) */}
      <SectionFade
        from="hsl(295 22% 11%)"
        to="hsl(var(--section-lilac-strong))"
        height="120px"
      />

      <Services />

      {/* Services (warm-soft) → SpaceHarmony (dark overlay) */}
      <SectionFade
        from="hsl(var(--section-warm-soft))"
        to="hsl(276 30% 12%)"
        height="100px"
      />

      <SpaceHarmony />

      {/* SpaceHarmony (dark) → GiftVoucher (warm) */}
      <SectionFade
        from="hsl(276 30% 12%)"
        to="hsl(var(--section-warm))"
        height="100px"
      />

      <GiftVoucher />

      {/* GiftVoucher (blush) → About (warm-soft) */}
      <SectionFade
        from="hsl(var(--section-blush))"
        to="hsl(var(--section-warm-soft))"
        height="80px"
      />

      <About />

      {/* About (lilac) → Testimonials (lilac-strong) */}
      <SectionFade
        from="hsl(var(--section-lilac))"
        to="hsl(var(--section-lilac-strong))"
        height="80px"
      />

      <Testimonials />

      {/* Testimonials (lilac) → FAQ (lilac) — subtle */}
      <SectionFade
        from="hsl(var(--section-lilac))"
        to="hsl(var(--section-lilac))"
        height="60px"
      />

      <FAQ />

      {/* FAQ (warm-soft) → CTABanner (lilac-strong) */}
      <SectionFade
        from="hsl(var(--section-warm-soft))"
        to="hsl(var(--section-lilac-strong))"
        height="100px"
      />

      <CTABanner />

      {/* CTABanner → Footer (dark) */}
      <SectionFade
        from="hsl(var(--section-warm))"
        to="hsl(300 20% 14%)"
        height="120px"
      />
    </main>
    <Footer />
    <WhatsAppFloat />
    <CookieConsent />
  </>
);

export default Index;
