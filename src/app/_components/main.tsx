import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, SparklesIcon } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";

function MainSection() {
  return (
    <section className="container mx-auto py-20 md:py-32">
      <div className="mx-auto max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Badge variant="secondary" className="mb-4">
            <SparklesIcon className="mr-1 h-3 w-3" />
            AI-Powered Expense Tracking
          </Badge>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-6 text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
        >
          Take Control of Your <span className="text-primary">Finances</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 text-balance text-lg text-muted-foreground md:text-xl"
        >
          Track expenses, set budgets, and achieve your financial goals with
          intelligent insights. Simple, powerful, and built for your success.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button size="lg" className="group">
            Start Free Trial
            <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="relative mx-auto max-w-5xl rounded-xl border border-border bg-card p-2 shadow-2xl">
            <Image
              src="/globe.svg"
              height={200}
              width={400}
              alt="Bucks Tracker Dashboard"
              className="mx-auto"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default MainSection;
