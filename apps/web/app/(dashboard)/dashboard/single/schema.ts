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
      type: z
        .literal("base")
        .describe(
          "The type of the element."
        ),
      props: z.array(
        z.object({
          key: z.string().describe("JSX React attribute"),
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
          name: z.string().describe("The name of the slot. It will be 'children' for components with single slot."),
          type: z.enum(["text", "dropzone"]),
          value: z
            .string()
            .optional()
            .describe("The text value of the slot when type is 'text'."),
        })
      ),
    })
  ),
});
