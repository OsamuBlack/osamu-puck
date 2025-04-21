"use client";

import type { Data } from "@measured/puck";
import { AutoField, Button, IconButton, Puck, usePuck } from "@measured/puck";
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
import { EyeIcon, EyeOff, Loader2 } from "lucide-react";
import ChatComponent from "@/components/chat";
import { toast } from "sonner";

export function Client() {
  const [tab, setTab] = useState<"components" | "chat">("components");
  const [data, setData] = useState<Data>({
    root: {},
    content: [],
  });
  const [loading, setLoading] = useState(true);

  return (
    <>
      <Puck
        config={config}
        data={data}
        overrides={{
          iframe(props) {
            const { appState, dispatch } = usePuck();

            useEffect(() => {
              try {
                const savedData = localStorage.getItem("puck");
                if (savedData) {
                  dispatch({
                    type: "setData",
                    data: JSON.parse(savedData),
                  });
                }
                setLoading(false);
              } catch (error) {
                console.error("Failed to load data from localStorage:", error);
              }
            }, []);

            if (props.document) {
              props.document.body.style.color = "black";
              props.document.body.style.backgroundColor = "white";

              // Add a script to the iframe document

              const script = props.document.createElement("script");
              script.src =
                "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"; // Replace with your script URL
              props.document.body.appendChild(script);
            }

            if (loading) {
              return (
                <div className="flex h-screen items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-black" />
                </div>
              );
            }

            return props.children as any;
          },
          outline(props) {
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
                  <ChatComponent />
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
                  title="Refresh"
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
          toast.success("Puck published successfully!");
          localStorage.setItem("puck", JSON.stringify(data));
        }}
      />
    </>
  );
}
