import { lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import ClaimsBanner from "@/components/ClaimsBanner";
import LiveSlotsFeed from "@/components/LiveSlotsFeed";
import HowItWorks from "@/components/HowItWorks";
import SectorShowcase from "@/components/SectorShowcase";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";
import NewsletterSignup from "@/components/NewsletterSignup";

const GlobeBackground = lazy(() => import("@/components/GlobeBackground"));

const Index = () => {
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
      <Footer />
    </div>
  );
};

export default Index;
