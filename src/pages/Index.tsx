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
    <main className="bg-[#3B2635]">
      <Hero />

      {/* Dark zone: Hero → TrustStrip → Services */}
      <div style={{ background: 'linear-gradient(180deg, #3B2635 0%, hsl(var(--section-lilac-strong)) 100%)' }}>
        <TrustStrip />
      </div>

      <Services />

      {/* Services (warm-soft) → SpaceHarmony (dark) */}
      <SectionFade
        from="hsl(var(--section-warm-soft))"
        to="#2E1D28"
        height="80px"
      />

      <SpaceHarmony />

      {/* SpaceHarmony (dark) → GiftVoucher (warm) */}
      <SectionFade
        from="#2E1D28"
        to="hsl(var(--section-warm))"
        height="80px"
      />

      <GiftVoucher />

      {/* GiftVoucher (blush) → About (warm-soft) — subtle */}
      <SectionFade
        from="hsl(var(--section-blush))"
        to="hsl(var(--section-warm-soft))"
        height="60px"
      />

      <About />

      {/* About (lilac) → Testimonials (lilac-strong) — subtle */}
      <SectionFade
        from="hsl(var(--section-lilac))"
        to="hsl(var(--section-lilac-strong))"
        height="60px"
      />

      <Testimonials />

      {/* Testimonials → FAQ — same family */}
      <SectionFade
        from="hsl(var(--section-lilac))"
        to="hsl(var(--section-lilac))"
        height="40px"
      />

      <FAQ />

      {/* FAQ (warm-soft) → CTABanner */}
      <SectionFade
        from="hsl(var(--section-warm-soft))"
        to="hsl(var(--section-lilac-strong))"
        height="80px"
      />

      <CTABanner />

      {/* CTABanner → Footer (dark) */}
      <SectionFade
        from="hsl(var(--section-warm))"
        to="#3B2635"
        height="80px"
      />
    </main>
    <Footer />
    <WhatsAppFloat />
    <CookieConsent />
  </>
);

export default Index;
