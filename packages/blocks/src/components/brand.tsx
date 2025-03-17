"use client";

import * as React from "react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@workspace/ui/components/sidebar";

export function Brand({
  activeTeam,
  linkComponent,
}: {
  activeTeam?: {
    name: string;
    logo: React.ReactNode;
    plan?: string;
  };
  linkComponent?: React.ComponentType<{ href: string; children: React.ReactNode }>;
}) {
  if (!activeTeam) {
    return null;
  }
  const LinkComponent = linkComponent || "a";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <LinkComponent href="/dashboard">
            <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg p-2">
              {activeTeam.logo}
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{activeTeam.name}</span>
              {activeTeam.plan && (
                <span className="truncate text-xs">{activeTeam.plan}</span>
              )}
            </div>
          </LinkComponent>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
