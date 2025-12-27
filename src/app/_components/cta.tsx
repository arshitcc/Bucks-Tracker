import { motion } from "motion/react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";

function CTA() {
  const { isSignedIn } = useAuth();

  return (
    <section className="py-20 md:py-32">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <Card className="border-2 border-primary/20 bg-linear-to-br from-primary/5 to-accent/5">
            <CardHeader className="text-center">
              <CardTitle className="mb-4 text-balance text-3xl md:text-4xl">
                Ready to Transform Your Financial Future?
              </CardTitle>
              <CardDescription className="text-pretty text-base md:text-lg">
                Join thousands of users who have taken control of their finances
                with Bucks Tracker. Start your free trial today, no credit card
                required.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <Button size="lg" className="group">
                  Start Free Trial
                  <ArrowRightIcon className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href={isSignedIn ? "/dashboard" : "/sign-in"}>
                <Button size="lg" variant="outline">
                  Schedule Demo
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}

export default CTA;
