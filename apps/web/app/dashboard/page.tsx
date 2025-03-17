import { AppSidebar } from "@workspace/blocks/components/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Separator } from "@workspace/ui/components/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@workspace/ui/components/sidebar";

import {
  BookOpen,
  Bot,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from "lucide-react";
import Link from "next/link";

export default function Page() {
  const data = {
    user: {
      name: "shadcn",
      email: "m@example.com",
      avatar: "/avatars/shadcn.jpg",
    },
    teams: [
      { name: "Acme Inc", logo: <GalleryVerticalEnd /> },
    ],
    navMain: [
      {
        groupLabel: "Platform",
        items: [
          {
            title: "Playground",
            url: "#",
            icon: <SquareTerminal />,
            isActive: true,
            items: [
              { title: "History", url: "#" },
              { title: "Starred", url: "#" },
              { title: "Settings", url: "#" },
            ],
          },
          {
            title: "Models",
            url: "#",
            icon: <Bot />,
            items: [
              { title: "Genesis", url: "#" },
              { title: "Explorer", url: "#" },
              { title: "Quantum", url: "#" },
            ],
          },
          {
            title: "Documentation",
            url: "#",
            icon: <BookOpen />,
            items: [
              { title: "Introduction", url: "#" },
              { title: "Get Started", url: "#" },
              { title: "Tutorials", url: "#" },
              { title: "Changelog", url: "#" },
            ],
          },
          {
            title: "Settings",
            url: "#",
            icon: <Settings2 />,
            
          },
        ],
      },
    ],
    projects: [
      { name: "Design Engineering", url: "#", icon: <Frame /> },
      { name: "Sales & Marketing", url: "#", icon: <PieChart /> },
      { name: "Travel", url: "#", icon: <Map /> },
    ],
    linkComponent: Link
  };

  return (
    <SidebarProvider>
      <AppSidebar
        teams={data.teams}
        navMain={data.navMain}
        user={data.user}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="grid auto-rows-min gap-4 md:grid-cols-3">
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
            <div className="bg-muted/50 aspect-video rounded-xl" />
          </div>
          <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
