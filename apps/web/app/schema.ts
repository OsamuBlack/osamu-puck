// import { BaseComponentSchema } from "@workspace/puck/base/config";
import { z } from "zod";

// const idSchema = z
//   .string()
//   .regex(/base-\d+$/)
//   .describe(
//     "Unique identifier for the content item. It follows the format `base-{id(${number})}`"
//   );

// const contentItemSchema = z.discriminatedUnion("type", [
//   z.object({
//     id: idSchema,
//     type: z.literal("base"),
//     props: BaseComponentSchema,
//   }),
// ]);

// const zoneKeySchema = z
//   .string()
//   .regex(/^[a-zA-Z0-9]+-[a-zA-Z0-9]+-\d+$/)
//   .describe(
//     "Zone key format: The first part 'base-{id(1)}' is the parent component id, and the second part after the colon is the zone name. "
//   );

// const NoneChildSchema = z.object({
//   children: z.literal("none"),
//   element: z.string(),
//   childrenProps: z.object({}),
// });

// // "text" variant
// const TextChildSchema = z.object({
//   children: z.literal("text"),
//   element: z.string(),
//   childrenProps: z.object({
//     value: z.string(),
//   }),
// });

// // "dropzone" variant: using our DropZoneSchema
// const DropzoneChildSchema = z.object({
//   children: z.literal("dropzone"),
// });

// const temp = z.array(
//     z.object({
//       id: z
//         .number()
//         .describe(
//           "Unique identifier for the content item. Must unique among all other content items. Use Whole numbers."
//         ),
//       parentId: z
//         .number()
//         .describe(
//           "The parent component id. If the element is nested, it should be the id of the parent component."
//         )
//         .optional(),

//       type: z.literal("base"),
//       props: z.object({
//         element: z.string().describe("The HTML element type"),
//         children: z
//           .enum(["none", "text", "dropzone"])
//           .describe(
//             "The type of children. None for null elements such as img. 'text' for elements that have text content. 'dropzone' for elements that have childrens."
//           ),
//         childrenProps: z
//           .object({
//             value: z
//               .string()
//               .optional()
//               .describe(
//                 "The properties of the children. If children is 'text', this should be a string."
//               ),
//           })
//           .optional(),
//         properties: z
//           .array(
//             z.object({
//               key: z.string().describe("JSX React property attribute"),
//               valueType: z.enum([
//                 "string",
//                 "number",
//                 "boolean",
//                 "function",
//                 "json",
//               ]),
//               value: z
//                 .string()
//                 .describe(
//                   "The value of the property, Give as string, and system will parse from it according to the valueType"
//                 ),
//             })
//           )
//           .describe("The keys of element attributes and their types"),
//       }),
//     })
//   ),

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

      type: z.literal("base"),
      props: z.object({
        element: z.string().describe("The HTML element type"),
        children: z
          .enum(["none", "text", "dropzone"])
          .describe(
            "The type of children. None for null elements such as img. 'text' for elements that have text content. 'dropzone' for elements that have childrens."
          ),
        childrenProps: z
          .object({
            value: z
              .string()
              .optional()
              .describe(
                "The properties of the children. If children is 'text', this should be a string."
              ),
          })
          .optional(),
        properties: z
          .array(
            z.object({
              key: z.string().describe("JSX React property attribute"),
              valueType: z.enum([
                "string",
                "number",
                "boolean",
                "function",
                "json",
              ]),
              value: z
                .string()
                .describe(
                  "The value of the property, Give as string, and system will parse from it according to the valueType"
                ),
            })
          )
          .describe("The keys of element attributes and their types"),
      }),
    })
  ),
});
