"use client";

import { ChevronRight, type LucideIcon } from "lucide-react";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@workspace/ui/components/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@workspace/ui/components/sidebar";

export function NavMain({
  groups,
  linkComponent,
}: {
  groups: {
    groupLabel: string;
    items: {
      title: string;
      url: string;
      icon?: React.ReactNode;
      isActive?: boolean;
      items?: { title: string; url: string }[];
    }[];
  }[];
  linkComponent?: React.ComponentType<{ href: string; children: React.ReactNode }>;
}) {
  // HTML anchor tag
  const LinkComponent = linkComponent || "a";
  return (
    <>
      {groups.map((group) => (
        <SidebarGroup key={group.groupLabel}>
          <SidebarGroupLabel>{group.groupLabel}</SidebarGroupLabel>
          <SidebarMenu>
            {group.items.map((item) => (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={item.isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    {item.items?.length ? (
                      <SidebarMenuButton tooltip={item.title}>
                        {item.icon}
                        <span>{item.title}</span>
                        <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    ) : (
                      <SidebarMenuButton asChild isActive={item.isActive}>
                        <LinkComponent href={item.url}>
                          {item.icon}
                          <span>{item.title}</span>
                        </LinkComponent>
                      </SidebarMenuButton>
                    )}
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <LinkComponent href={subItem.url}>
                              <span>{subItem.title}</span>
                            </LinkComponent>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      ))}
    </>
  );
}
