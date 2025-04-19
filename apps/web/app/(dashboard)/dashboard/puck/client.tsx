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
import { ChatInterface } from "@/components/chat-interface";
// import config from "@/puck.config.test";
import config from "@/puck.config";
import { RefreshCcw } from "lucide-react";

export function Client() {
  const [tab, setTab] = useState<"components" | "chat">("components");
  const data = localStorage.getItem("puck")
    ? (JSON.parse(localStorage.getItem("puck") || "") as Data)
    : {};

  return (
    <>
      <Puck
        config={config}
        data={data}
        overrides={{
          iframe(props) {
            if (props.document) {
              props.document.body.style.color = "black";
              props.document.body.style.backgroundColor = "white";

              // Add a script to the iframe document

              const script = props.document.createElement("script");
              script.src =
                "https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"; // Replace with your script URL
              props.document.body.appendChild(script);
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
                  <ChatInterface />
                </TabsContent>
              </Tabs>
            );
          },
          headerActions(props) {
            return (
              <div className="flex items-center gap-2">
                
                {props.children}
              </div>
            );
          },
        }}
        onPublish={async (data) => {
          localStorage.setItem("puck", JSON.stringify(data));
        }}
      />
    </>
  );
}
