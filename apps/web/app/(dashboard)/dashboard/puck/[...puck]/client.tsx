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
import headingAnalyzer from "@measured/puck-plugin-heading-analyzer";
import "@measured/puck-plugin-heading-analyzer/dist/index.css";
import { styles } from "./styles";

export function Client({
  data,
  path,
  prompt,
}: {
  data: Data;
  path: string;
  prompt?: string;
}) {
  return (
    <Puck
      config={config}
      data={data}
      overrides={{
        iframe(props) {
          if (props.document) {
            props.document.body.style.color = "black";
            props.document.body.style.backgroundColor = "white";

            // Inject Tailwind styles (A quick hack for now)
            const tailwindScript = props.document.createElement("script");
            tailwindScript.src =
              "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4";
            props.document.head.appendChild(tailwindScript);

            // Inject theme variables from globals.css
            const styleElement = props.document.createElement("style");
            styleElement.textContent = styles;
            props.document.head.appendChild(styleElement);
          }

          return props.children as any;
        },
        outline(props) {
          const [tab, setTab] = useState<"components" | "chat">(
            prompt ? "chat" : "components"
          );

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
                <ChatComponent prompt={prompt} />
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
      plugins={[headingAnalyzer]}
    />
  );
}
