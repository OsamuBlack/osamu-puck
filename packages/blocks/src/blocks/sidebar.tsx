"use client";

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";
import { Separator } from "@radix-ui/react-separator";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  // teams: { name: string; logo: React.ReactNode; plan?: string; href: string }[];
  // navMain: {
  //   groupLabel: string;
  //   items: {
  //     title: string;
  //     url: string;
  //     icon?: React.ReactNode;
  //     isActive?: boolean;
  //     items?: { title: string; url: string }[];
  //   }[];
  // }[];
  // // projects: { name: string; url: string; icon: LucideIcon }[];
  // user: { name: string; email: string; avatar: string };
  // onLogout?: () => void;
  // dropdownItems?: React.ReactNode[];
  // // New property for a custom link component.
  // linkComponent?: React.ComponentType<{
  //   href: string;
  //   children: React.ReactNode;
  // }>;
  brandContent?: React.ReactNode;
  navBarContent?: React.ReactNode;
  footerContent?: React.ReactNode;
  children: React.ReactNode;
}

export function AppSidebar({
  brandContent,
  footerContent,
  navBarContent,
  children,
  ...props
}: AppSidebarProps) {
  return (
    <SidebarProvider>
      <Sidebar collapsible="icon" {...props}>
        {brandContent && <SidebarHeader>{brandContent}</SidebarHeader>}
        <SidebarContent>
          {children}
          {/* <NavMain groups={navMain} linkComponent={linkComponent} /> */}
          {/* <NavProjects projects={projects} /> */}
        </SidebarContent>
        {footerContent && (
          <SidebarFooter>
            {footerContent}
            {/* <TeamSwitcher teams={teams} /> */}
            {/* <NavUser user={user} /> */}
          </SidebarFooter>
        )}
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            {navBarContent}
          </div>
        </header>
      </SidebarInset>
    </SidebarProvider>
  );
}
