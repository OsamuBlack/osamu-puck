"use client";

import * as React from "react";

import { NavMain } from "@workspace/blocks/components/nav-main";
import { NavUser } from "@workspace/blocks/components/nav-user";
import { TeamSwitcher } from "@workspace/blocks/components/team-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@workspace/ui/components/sidebar";
import { Brand } from "./brand.js";

// Add or update the props type for AppSidebar.
export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  teams: { name: string; logo: React.ReactNode; plan?: string }[];
  navMain: {
    groupLabel: string;
    items: {
      title: string;
      url: string;
      icon?: React.ReactNode;
      isActive?: boolean;
      items?: { title: string; url: string }[];
    }[];
  }[];
  // projects: { name: string; url: string; icon: LucideIcon }[];
  user: { name: string; email: string; avatar: string };
  // New property for a custom link component.
  linkComponent?: React.ComponentType<{
    href: string;
    children: React.ReactNode;
  }>;
}

export function AppSidebar({
  teams,
  navMain,
  // projects,
  user,
  linkComponent,
  ...props
}: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        {teams.length === 1 ? (
          <Brand activeTeam={teams[0]} linkComponent={linkComponent} />
        ) : (
          <TeamSwitcher teams={teams} />
        )}
      </SidebarHeader>
      <SidebarContent>
        <NavMain groups={navMain} linkComponent={linkComponent} />
        {/* <NavProjects projects={projects} /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
