import { MetadatSchema } from "@workspace/puck/next-meta/config";
import { z } from "zod";

export const puckSchema = z.object({
  info: z.string().describe("What actions you performed."),
  content: z.array(
    z.object({
      id: z
        .number()
        .describe(
          "Unique identifier for the content item. Must unique among all other content items. Use Whole numbers."
        ),
      parentId: z
        .number()
        .describe(
          "The parent component id. If the element is nested, it should be the id of the parent component."
        )
        .optional(),
      zoneName: z
        .string()
        .describe(
          "Only if the element is nested, it should be the name of the zone. For example, 'header', 'footer', 'content' or 'children'."
        )
        .optional(),

      type: z
        .enum(["base", "card", "typography", "button", "container"])
        .describe(
          "The type of the component. For intrinsic components, use 'base'."
        ),
      props: z.array(
        z.object({
          key: z
            .string()
            .describe(
              "JSX React or shad-cn ui attribute. For Nested components, use dot notation. like 'header.title'."
            ),
          valueType: z.enum(["string", "number", "boolean", "json"]),
          value: z
            .string()
            .describe(
              "The value of the property, Give as string, and system will parse from it according to the valueType"
            ),
        })
      ),
      slots: z.array(
        z.object({
          name: z
            .string()
            .describe(
              "The name of the slot. It will be 'children' for components with single slot. If the component has multiple slots, specify the name of the slot like 'header', 'footer' 'content'."
            ),
          type: z.enum(["text", "dropzone"]),
          value: z
            .string()
            .optional()
            .describe("The text value of the slot when type is 'text'."),
        })
      ),
    })
  ),
  root: z.object({
    title: z
      .string()
      .describe("Page Title will be used for SEO and browser tab."),
    description: z.string().describe("Meta Description for seo."),
    ogImages: z.array(
      z.object({
        width: z.number().describe("Width"),
        height: z.number().describe("Height"),
        alt: z.string().describe("Alt Text"),
        url: z.string().describe("URL"),
      })
    ),
  }),
});
