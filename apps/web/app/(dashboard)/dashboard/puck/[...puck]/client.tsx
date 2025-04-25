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
import config from "../puck.config";
import { EyeIcon, EyeOff, Loader2, Plus } from "lucide-react";
import ChatComponent from "@/components/chat-agent";
import { toast } from "sonner";

export function Client({
  data,
  path,
  prompt,
}: {
  data: Data;
  path: string;
  prompt?: string;
}) {
  console.log(prompt)

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
                  <ChatComponent path={"/api/agent/google"} prompt={prompt} />
                </TabsContent>
              </Tabs>
            );
          },
          headerActions(props) {
            const {
              appState: {
                ui: { previewMode },
              },
              dispatch,
            } = usePuck();

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
                {props.children}
              </div>
            );
          },
        }}
        onPublish={async (data) => {
          await fetch("/api/save", {
            method: "post",
            body: JSON.stringify({ data, path }),
          });
          toast.success("Puck published successfully!");
        }}
      />
    </>
  );
}
