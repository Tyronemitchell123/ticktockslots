import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import LiveSlotsFeed from "@/components/LiveSlotsFeed";
import HowItWorks from "@/components/HowItWorks";
import SectorShowcase from "@/components/SectorShowcase";
import PricingSection from "@/components/PricingSection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <div id="slots"><LiveSlotsFeed /></div>
      <div id="how"><HowItWorks /></div>
      <div id="sectors"><SectorShowcase /></div>
      <div id="pricing"><PricingSection /></div>
      <Footer />
    </div>
  );
};

export default Index;
