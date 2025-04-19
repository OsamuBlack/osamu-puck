import { ComponentConfig } from "@measured/puck";
import { AppSidebar, AppSidebarProps } from "@workspace/blocks/sidebar";
import { GalleryVerticalEnd } from "lucide-react";
import React, { ReactNode } from "react";

export const SidebarConfig: ComponentConfig = {
  label: "Sidebar",
  render: ({ puck: { renderDropZone }, id, editMode, ...props }) => (
    <AppSidebar
      {...props}
      brandContent={
        renderDropZone({
          zone: "header",
        }) as ReactNode
      }
      navBarContent={
        renderDropZone({
          zone: "navBar",
          minEmptyHeight: 32,
        }) as ReactNode
      }
      footerContent={
        renderDropZone({
          zone: "footer",
        }) as ReactNode
      }
    >
      {
        renderDropZone({
          zone: "children",
        }) as ReactNode
      }
    </AppSidebar>
  ),
};
