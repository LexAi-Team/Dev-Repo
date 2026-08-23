import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import ValueProposition from "@/components/value-proposition";
import CoreFeatures from "@/components/core-features";
import HowItWorks from "@/components/how-it-works";
import KnowledgeSection from "@/components/knowledge-section";
import CourtroomShowcase from "@/components/courtroom-showcase";
import NetworkSection from "@/components/network-section";
import AudienceSection from "@/components/audience-section";
import SecuritySection from "@/components/security-section";
import FinalCTA from "@/components/final-cta";
import Footer from "@/components/footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F8F4EC] text-[#21170F] selection:bg-[#D9B16A]/30 selection:text-[#21170F]">
      <Navbar />
      <Hero />
      <ValueProposition />
      <CoreFeatures />
      <HowItWorks />
      <KnowledgeSection />
      <CourtroomShowcase />
      <NetworkSection />
      <AudienceSection />
      <SecuritySection />
      <FinalCTA />
      <Footer />
    </main>
  );
}
