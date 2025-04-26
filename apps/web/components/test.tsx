"use client";

import { usePuck } from "@measured/puck";
import { Button } from "@workspace/ui/components/button";

export default function TestApplyToJson() {
  const puck = usePuck();
  return (
    <Button
      onClick={() => {
        puck.dispatch({
          type: "setData",
          data: {
            content: [
              {
                type: "base",
                props: {
                  element: "div",
                  slot: { type: "dropzone", props: { value: "Hello World" } },
                  properties: [{ key: "className", valueType: "string" }],
                  values: { className: "" },
                  id: "base-027fc546-e0a5-4b56-bd0d-74ae6bfa6c7f",
                },
              },
            ],
            root: {
            },
            zones: {
              "base-027fc546-e0a5-4b56-bd0d-74ae6bfa6c7f:children": [
                {
                  type: "base",
                  props: {
                    element: "div",
                    slot: { type: "dropzone", props: { value: "Hello World" } },
                    properties: [{ key: "className", valueType: "string" }],
                    values: { className: "" },
                    id: "base-17acfccf-2841-4d66-9ffb-b7f351797c0e",
                  },
                },
              ],
              "base-17acfccf-2841-4d66-9ffb-b7f351797c0e:children": [
                {
                  type: "base",
                  props: {
                    element: "div",
                    slot: { type: "text", props: { value: "Hello World" } },
                    properties: [{ key: "className", valueType: "string" }],
                    values: { className: "" },
                    id: "base-cfc69021-2c70-4eef-ab0e-7c6ae943db1c",
                  },
                },
              ],
            },
          },
        });
      }}
    >
      Test
    </Button>
  );
}
