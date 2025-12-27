import { SignedIn } from "@clerk/nextjs";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashbord - Bucks Tracker",
  description: "Manage your finances with ease",
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
