import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { MenuIcon, WalletIcon, XIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const { isSignedIn } = useAuth();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <nav className="container mx-auto flex h-16 items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <WalletIcon className="h-6 w-6 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold">Bucks Tracker</span>
        </motion.div>

        {/* Desktop Navigation */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="hidden items-center gap-8 md:flex"
        >
          <Link
            href="#features"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Features
          </Link>
          <Link
            href="#testimonials"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Testimonials
          </Link>
          <Link
            href="#pricing"
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Pricing
          </Link>
        </motion.div>

        {/* Desktop CTA */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="hidden md:block"
        >
          <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
            <Button>Get Started</Button>
          </Link>
        </motion.div>

        {/* Mobile Menu Button */}
        <Button
          className="md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <XIcon className="h-6 w-6" />
          ) : (
            <MenuIcon className="h-6 w-6" />
          )}
        </Button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-t border-border md:hidden"
        >
          <div className="container space-y-4 py-4">
            <Link
              href="#features"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              Features
            </Link>
            <Link
              href="#testimonials"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              Testimonials
            </Link>
            <Link
              href="#pricing"
              className="block text-sm font-medium text-foreground/80 hover:text-foreground"
            >
              Pricing
            </Link>
            <Button className="w-full">Get Started</Button>
          </div>
        </motion.div>
      )}
    </header>
  );
}

export default Header;
