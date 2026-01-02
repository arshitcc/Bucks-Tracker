import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "./_components/dashboard-sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="p-4">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
