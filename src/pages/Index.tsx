import { lazy, Suspense } from "react";
import { LAUNCH_MODE } from "@/lib/site-config";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ClaimsBanner from "@/components/ClaimsBanner";
import LiveSlotsFeed from "@/components/LiveSlotsFeed";
import HowItWorks from "@/components/HowItWorks";
import SectorShowcase from "@/components/SectorShowcase";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";
import WaitlistLanding from "@/pages/WaitlistLanding";

const GlobeBackground = lazy(() => import("@/components/GlobeBackground"));

const Index = () => {
  if (LAUNCH_MODE === "waitlist") {
    return <WaitlistLanding />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ClaimsBanner />
      <div id="slots" className="relative">
        <Suspense fallback={null}>
          <GlobeBackground />
        </Suspense>
        <div className="relative z-10">
          <LiveSlotsFeed />
        </div>
      </div>
      <div id="how"><HowItWorks /></div>
      <div id="sectors"><SectorShowcase /></div>
      <div id="pricing"><PricingSection /></div>
      <NewsletterSignup />
      <Footer />
    </div>
  );
};

export default Index;
