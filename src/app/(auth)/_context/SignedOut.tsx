"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

function SignedOut({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn) {
      router.replace("/dashboard");
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded || isSignedIn) return null;
  return <>{children}</>;
}

export default SignedOut;
