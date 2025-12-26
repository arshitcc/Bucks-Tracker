"use client";

import Header from "./_components/header";
import MainSection from "./_components/main";
import Footer from "./_components/footer";
import CTA from "./_components/cta";
import Pricing from "./_components/pricing";
import Testimonials from "./_components/testimonials";
import Features from "./_components/features";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";

export default function Home() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="min-h-screen">
      <Header />
      <MainSection />
      <Features />
      <Testimonials />
      <Pricing />
      <CTA />
      <Footer />

      <Button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        variant="outline"
        size="icon"
        className="fixed bottom-12 right-12"
      >
        <SunIcon className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
        <MoonIcon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      </Button>
    </div>
  );
}
