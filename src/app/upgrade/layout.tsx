import { SignedIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upgrade - Bucks Tracker",
  description: "Upgrade limits for AI powered expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-poppins">
      <SignedIn>{children}</SignedIn>
    </div>
  );
}
