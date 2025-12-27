import { Metadata } from "next";
import SignedOut from "./_context/SignedOut";

export const metadata: Metadata = {
  title: "Bucks Tracker - Authentication",
  description: "AI powered expense tracker",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="font-poppins">
      <SignedOut>{children}</SignedOut>
    </div>
  );
}
