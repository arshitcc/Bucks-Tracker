"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { NavUser } from "./nav-user";
import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import {
  ChartNoAxesCombinedIcon,
  GoalIcon,
  LandmarkIcon,
  LayoutTemplate,
  PanelLeftIcon,
  ReceiptTextIcon,
  WalletIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const items = [
  {
    title: "Overview",
    url: "/dashboard/overview",
    icon: ChartNoAxesCombinedIcon,
  },
  {
    title: "Wallets",
    url: "/dashboard/wallets",
    icon: LandmarkIcon,
  },
  {
    title: "Goals",
    url: "/dashboard/goals",
    icon: GoalIcon,
  },
  {
    title: "Budgets",
    url: "/dashboard/budgets",
    icon: LayoutTemplate,
  },
  {
    title: "Transactions",
    url: "/dashboard/transactions",
    icon: ReceiptTextIcon,
  },
];

function DashboardSidebar() {
  const { user } = useUser();
  const { isMobile, open, setOpen, setOpenMobile } = useSidebar();
  return (
    <Sidebar side="left" variant="floating" collapsible="icon">
      <SidebarHeader>
        <Link className="group flex flex-row items-center gap-2" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <WalletIcon className="size-6 text-primary-foreground" />
          </div>
          {open && (
            <span className="text-xl font-bold text-primary">
              Bucks Tracker
            </span>
          )}
        </Link>

        <Button
          className="absolute cursor-pointer justify-self-end rounded-full bg-muted hover:bg-muted text-black dark:text-white border -right-2 bottom-16"
          onClick={() => {
            if (isMobile) {
              setOpenMobile(false);
            } else {
              setOpen(!open);
            }
          }}
          size="icon"
        >
          <PanelLeftIcon />
        </Button>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <Link href={item.url} key={item.title}>
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton tooltip={item.title}>
                      {item.icon && <item.icon className="size-4" />}
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: user?.fullName ?? "",
            email: user?.primaryEmailAddress?.emailAddress ?? "",
            avatar: user?.imageUrl ?? "",
          }}
        />
      </SidebarFooter>
    </Sidebar>
  );
}

export default DashboardSidebar;
