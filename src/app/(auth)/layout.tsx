import { Metadata } from "next";
import SignedOut from "./_context/SignedOut";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Bucks Tracker - Authentication",
  description: "AI powered expense tracker",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard/overview");
  }

  return (
    <div className="font-poppins">
      <SignedOut>{children}</SignedOut>
    </div>
  );
}
