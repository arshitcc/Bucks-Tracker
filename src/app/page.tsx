"use client";

import Header from "./_components/header";
import MainSection from "./_components/main";
import Footer from "./_components/footer";
import CTA from "./_components/cta";
import Pricing from "./_components/pricing";
import Testimonials from "./_components/testimonials";
import Features from "./_components/features";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <MainSection />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />
    </div>
  );
}
