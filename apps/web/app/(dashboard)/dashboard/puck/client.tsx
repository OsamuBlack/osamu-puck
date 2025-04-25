"use client";

import type { Data } from "@measured/puck";
import { IconButton, Puck, usePuck } from "@measured/puck";
import { useEffect, useState } from "react";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
// import { ChatInterface } from "@/components/chat-interface";
// import config from "@/puck.config.test";
import config from "./puck.config";
import { EyeIcon, EyeOff, Loader2, Plus } from "lucide-react";
import ChatComponent from "@/components/chat";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { toast } from "sonner";

export function Client({ data }: { data: Data }) {
  return (
    <>
      <Puck
        config={config}
        data={data}
        overrides={{
          iframe(props) {
            const { appState, dispatch } = usePuck();

            if (props.document) {
              props.document.body.style.color = "black";
              props.document.body.style.backgroundColor = "white";

              // Inject Tailwind styles
              const tailwindScript = props.document.createElement("script");
              tailwindScript.src =
                "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
              props.document.head.appendChild(tailwindScript);

              // Inject theme variables from globals.css
              const styleElement = props.document.createElement("style");
              styleElement.textContent = `
                @theme {
                  --color-background: var(--background);
                  --color-foreground: var(--foreground);
                  --color-card: var(--card);
                  --color-card-foreground: var(--card-foreground);
                  --color-popover: var(--popover);
                  --color-popover-foreground: var(--popover-foreground);
                  --color-primary: var(--primary);
                  --color-primary-foreground: var(--primary-foreground);
                  --color-secondary: var(--secondary);
                  --color-secondary-foreground: var(--secondary-foreground);
                  --color-muted: var(--muted);
                  --color-muted-foreground: var(--muted-foreground);
                  --color-accent: var(--accent);
                  --color-accent-foreground: var(--accent-foreground);
                  --color-destructive: var(--destructive);
                  --color-destructive-foreground: var(--destructive-foreground);
                  --color-border: var(--border);
                  --color-input: var(--input);
                  --color-ring: var(--ring);
                  --color-chart-1: var(--chart-1);
                  --color-chart-2: var(--chart-2);
                  --color-chart-3: var(--chart-3);
                  --color-chart-4: var(--chart-4);
                  --color-chart-5: var(--chart-5);
                  --radius-sm: calc(var(--radius) - 4px);
                  --radius-md: calc(var(--radius) - 2px);
                  --radius-lg: var(--radius);
                  --radius-xl: calc(var(--radius) + 4px);
                  --color-sidebar: var(--sidebar);
                  --color-sidebar-foreground: var(--sidebar-foreground);
                  --color-sidebar-primary: var(--sidebar-primary);
                  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
                  --color-sidebar-accent: var(--sidebar-accent);
                  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
                  --color-sidebar-border: var(--sidebar-border);
                  --color-sidebar-ring: var(--sidebar-ring);
                }
              `;
              props.document.head.appendChild(styleElement);

              // Copy the CSS variables from globals.css
              // const cssVarsElement = props.document.createElement("style");
              // cssVarsElement.textContent = `
              //   :root {
              //     --radius: 0rem;
              //     --background: oklch(1 0 0);
              //     --foreground: oklch(0.141 0.005 285.823);
              //     --card: oklch(1 0 0);
              //     --card-foreground: oklch(0.141 0.005 285.823);
              //     --popover: oklch(1 0 0);
              //     --popover-foreground: oklch(0.141 0.005 285.823);
              //     --primary: oklch(0.21 0.006 285.885);
              //     --primary-foreground: oklch(0.985 0 0);
              //     --secondary: oklch(0.967 0.001 286.375);
              //     --secondary-foreground: oklch(0.21 0.006 285.885);
              //     --muted: oklch(0.967 0.001 286.375);
              //     --muted-foreground: oklch(0.552 0.016 285.938);
              //     --accent: oklch(0.967 0.001 286.375);
              //     --accent-foreground: oklch(0.21 0.006 285.885);
              //     --destructive: oklch(0.577 0.245 27.325);
              //     --border: oklch(0.92 0.004 286.32);
              //     --input: oklch(0.92 0.004 286.32);
              //     --ring: oklch(0.705 0.015 286.067);
              //     --chart-1: oklch(0.646 0.222 41.116);
              //     --chart-2: oklch(0.6 0.118 184.704);
              //     --chart-3: oklch(0.398 0.07 227.392);
              //     --chart-4: oklch(0.828 0.189 84.429);
              //     --chart-5: oklch(0.769 0.188 70.08);
              //     --sidebar: oklch(0.985 0 0);
              //     --sidebar-foreground: oklch(0.141 0.005 285.823);
              //     --sidebar-primary: oklch(0.21 0.006 285.885);
              //     --sidebar-primary-foreground: oklch(0.985 0 0);
              //     --sidebar-accent: oklch(0.967 0.001 286.375);
              //     --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
              //     --sidebar-border: oklch(0.92 0.004 286.32);
              //     --sidebar-ring: oklch(0.705 0.015 286.067);
              //   }

              //   .dark {
              //     --background: oklch(0.141 0.005 285.823);
              //     --foreground: oklch(0.985 0 0);
              //     --card: oklch(0.21 0.006 285.885);
              //     --card-foreground: oklch(0.985 0 0);
              //     --popover: oklch(0.21 0.006 285.885);
              //     --popover-foreground: oklch(0.985 0 0);
              //     --primary: oklch(0.92 0.004 286.32);
              //     --primary-foreground: oklch(0.21 0.006 285.885);
              //     --secondary: oklch(0.274 0.006 286.033);
              //     --secondary-foreground: oklch(0.985 0 0);
              //     --muted: oklch(0.274 0.006 286.033);
              //     --muted-foreground: oklch(0.705 0.015 286.067);
              //     --accent: oklch(0.274 0.006 286.033);
              //     --accent-foreground: oklch(0.985 0 0);
              //     --destructive: oklch(0.704 0.191 22.216);
              //     --border: oklch(1 0 0 / 10%);
              //     --input: oklch(1 0 0 / 15%);
              //     --ring: oklch(0.552 0.016 285.938);
              //     --chart-1: oklch(0.488 0.243 264.376);
              //     --chart-2: oklch(0.696 0.17 162.48);
              //     --chart-3: oklch(0.769 0.188 70.08);
              //     --chart-4: oklch(0.627 0.265 303.9);
              //     --chart-5: oklch(0.645 0.246 16.439);
              //     --sidebar: oklch(0.21 0.006 285.885);
              //     --sidebar-foreground: oklch(0.985 0 0);
              //     --sidebar-primary: oklch(0.488 0.243 264.376);
              //     --sidebar-primary-foreground: oklch(0.985 0 0);
              //     --sidebar-accent: oklch(0.274 0.006 286.033);
              //     --sidebar-accent-foreground: oklch(0.985 0 0);
              //     --sidebar-border: oklch(1 0 0 / 10%);
              //     --sidebar-ring: oklch(0.552 0.016 285.938);
              //   }:root {
              //     --radius: 0rem;
              //     --background: oklch(1 0 0);
              //     --foreground: oklch(0.141 0.005 285.823);
              //     --card: oklch(1 0 0);
              //     --card-foreground: oklch(0.141 0.005 285.823);
              //     --popover: oklch(1 0 0);
              //     --popover-foreground: oklch(0.141 0.005 285.823);
              //     --primary: oklch(0.21 0.006 285.885);
              //     --primary-foreground: oklch(0.985 0 0);
              //     --secondary: oklch(0.967 0.001 286.375);
              //     --secondary-foreground: oklch(0.21 0.006 285.885);
              //     --muted: oklch(0.967 0.001 286.375);
              //     --muted-foreground: oklch(0.552 0.016 285.938);
              //     --accent: oklch(0.967 0.001 286.375);
              //     --accent-foreground: oklch(0.21 0.006 285.885);
              //     --destructive: oklch(0.577 0.245 27.325);
              //     --border: oklch(0.92 0.004 286.32);
              //     --input: oklch(0.92 0.004 286.32);
              //     --ring: oklch(0.705 0.015 286.067);
              //     --chart-1: oklch(0.646 0.222 41.116);
              //     --chart-2: oklch(0.6 0.118 184.704);
              //     --chart-3: oklch(0.398 0.07 227.392);
              //     --chart-4: oklch(0.828 0.189 84.429);
              //     --chart-5: oklch(0.769 0.188 70.08);
              //     --sidebar: oklch(0.985 0 0);
              //     --sidebar-foreground: oklch(0.141 0.005 285.823);
              //     --sidebar-primary: oklch(0.21 0.006 285.885);
              //     --sidebar-primary-foreground: oklch(0.985 0 0);
              //     --sidebar-accent: oklch(0.967 0.001 286.375);
              //     --sidebar-accent-foreground: oklch(0.21 0.006 285.885);
              //     --sidebar-border: oklch(0.92 0.004 286.32);
              //     --sidebar-ring: oklch(0.705 0.015 286.067);
              //   }

              //   .dark {
              //     --background: oklch(0.141 0.005 285.823);
              //     --foreground: oklch(0.985 0 0);
              //     --card: oklch(0.21 0.006 285.885);
              //     --card-foreground: oklch(0.985 0 0);
              //     --popover: oklch(0.21 0.006 285.885);
              //     --popover-foreground: oklch(0.985 0 0);
              //     --primary: oklch(0.92 0.004 286.32);
              //     --primary-foreground: oklch(0.21 0.006 285.885);
              //     --secondary: oklch(0.274 0.006 286.033);
              //     --secondary-foreground: oklch(0.985 0 0);
              //     --muted: oklch(0.274 0.006 286.033);
              //     --muted-foreground: oklch(0.705 0.015 286.067);
              //     --accent: oklch(0.274 0.006 286.033);
              //     --accent-foreground: oklch(0.985 0 0);
              //     --destructive: oklch(0.704 0.191 22.216);
              //     --border: oklch(1 0 0 / 10%);
              //     --input: oklch(1 0 0 / 15%);
              //     --ring: oklch(0.552 0.016 285.938);
              //     --chart-1: oklch(0.488 0.243 264.376);
              //     --chart-2: oklch(0.696 0.17 162.48);
              //     --chart-3: oklch(0.769 0.188 70.08);
              //     --chart-4: oklch(0.627 0.265 303.9);
              //     --chart-5: oklch(0.645 0.246 16.439);
              //     --sidebar: oklch(0.21 0.006 285.885);
              //     --sidebar-foreground: oklch(0.985 0 0);
              //     --sidebar-primary: oklch(0.488 0.243 264.376);
              //     --sidebar-primary-foreground: oklch(0.985 0 0);
              //     --sidebar-accent: oklch(0.274 0.006 286.033);
              //     --sidebar-accent-foreground: oklch(0.985 0 0);
              //     --sidebar-border: oklch(1 0 0 / 10%);
              //     --sidebar-ring: oklch(0.552 0.016 285.938);
              //   }
              // `;
              // props.document.head.appendChild(cssVarsElement);
            }

            return props.children as any;
          },
          outline(props) {
            const [tab, setTab] = useState<"components" | "chat">("components");

            return (
              <Tabs value={tab}>
                <TabsList className="w-full justify-center bg-white text-black">
                  <TabsTrigger
                    value="components"
                    onClick={() => setTab("components")}
                  >
                    Components
                  </TabsTrigger>
                  <TabsTrigger value="chat" onClick={() => setTab("chat")}>
                    Chat
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="components">{props.children}</TabsContent>
                <TabsContent value="chat">
                  {/* <ChatInterface /> */}
                  <ChatComponent path={"/api/agent/google"} />
                </TabsContent>
              </Tabs>
            );
          },
          headerActions(props) {
            const {
              appState: {
                ui: { previewMode },
                data: currentData,
              },
              dispatch,
            } = usePuck();

            // const [pages, setPages] = useState<Record<string, Data>>({
            //   "/": data,
            // });
            // const [selectedPage, setSelectedPage] = useState<string>("/");
            // const [isPageSwitching, setIsPageSwitching] = useState<boolean>(false);

            // // Save current page data when it changes
            // useEffect(() => {
            //   if (!isPageSwitching && selectedPage) {
            //     setPages((prev) => ({
            //       ...prev,
            //       [selectedPage]: currentData,
            //     }));
            //   }
            // }, [currentData, selectedPage, isPageSwitching]);

            // // Handle page switching
            // const handlePageChange = (newPagePath: string) => {
            //   // First save current page data
            //   setPages((prev) => ({
            //     ...prev,
            //     [selectedPage]: currentData,
            //   }));
              
            //   // Set flag to prevent immediate overwrite from the effect above
            //   setIsPageSwitching(true);
              
            //   // Set selected page and load its data
            //   setSelectedPage(newPagePath);
            //   dispatch({
            //     type: "setData",
            //     data: pages[newPagePath],
            //   });
              
            //   // Reset flag after a short delay
            //   setTimeout(() => setIsPageSwitching(false), 100);
            // };

            return (
              <div className="flex items-center gap-4">
                <IconButton
                  title={"Preview mode"}
                  onClick={() => {
                    dispatch({
                      type: "setUi",
                      ui(previous) {
                        return {
                          ...previous,
                          previewMode:
                            previewMode === "edit" ? "interactive" : "edit",
                        };
                      },
                    });
                  }}
                  variant="secondary"
                >
                  {previewMode === "interactive" ? (
                    <EyeOff size="16" />
                  ) : (
                    <EyeIcon size="16" />
                  )}
                </IconButton>
                {/* <Select value={selectedPage} onValueChange={handlePageChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a Page" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(pages).map(([key, value]) => (
                      <SelectItem
                        key={key}
                        value={key}
                      >
                        {value.root.props?.title || key.replace('/', '') || "Home"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <IconButton
                  title="Add Page"
                  variant="secondary"
                  onClick={() => {
                    // Save current page before creating a new one
                    setPages((prev) => ({
                      ...prev,
                      [selectedPage]: currentData,
                    }));
                    
                    const index = Object.keys(pages).length + 1;
                    const pagePath = `/page-${index}`;
                    const newPage = {
                      root: {
                        props: {
                          title: `Page ${index}`,
                        },
                      },
                      content: [],
                    };
                    
                    setIsPageSwitching(true);
                    setPages((prev) => ({
                      ...prev,
                      [pagePath]: newPage,
                    }));
                    
                    dispatch({
                      type: "setData",
                      data: newPage,
                    });
                    
                    setSelectedPage(pagePath);
                    toast.success(`New page "${newPage.root.props.title}" created!`);
                    
                    setTimeout(() => setIsPageSwitching(false), 100);
                  }}
                >
                  <Plus className="size-4" />
                </IconButton> */}
                {props.children}
              </div>
            );
          },
        }}
        onPublish={async (data) => {
          await fetch("/api/save", {
            method: "post",
            body: JSON.stringify({ data, path: "/dashboard/editShadcn" }),
          });
          toast.success("Puck published successfully!");
        }}
      />
    </>
  );
}
