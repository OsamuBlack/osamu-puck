import * as z from "zod";
import { PuckContext } from "@measured/puck";
export { DropzoneBuilder, renderChild } from "./render.js";

// Zod schema for DropZoneProps
export const DropZoneSchema = z.object({
  allow: z.array(z.string()).optional(),
  disallow: z.array(z.string()).optional(),
  // You may refine the CSSProperties schema if needed
  style: z.any().optional(),
  minEmptyHeight: z.number().optional(),
  className: z.string().optional(),
  collisionAxis: z.enum(["x", "y", "dynamic"]).optional(),
});

export type DropZoneProps = z.infer<typeof DropZoneSchema>;

// Dropzone Builder props
export type DropzoneBuilderProps = {
  zone: string;
  dropzoneProperties: DropZoneProps;
  puck: PuckContext;
};

// Zod schemas for children types

// "none" variant
const NoneChildSchema = z.object({
  children: z.literal("none"),
  element: z.string(),
  childrenProps: z.object({}),
});

// "text" variant
const TextChildSchema = z.object({
  children: z.literal("text"),
  element: z.string(),
  childrenProps: z.object({
    value: z.string(),
  }),
});

// "dropzone" variant: using our DropZoneSchema
const DropzoneChildSchema = z.object({
  children: z.literal("dropzone"),
  childrenProps: DropZoneSchema,
});

// Union of the three possible children types using discriminatedUnion
export const ChildrenSchema = z
  .discriminatedUnion("children", [
    NoneChildSchema,
    TextChildSchema,
    DropzoneChildSchema,
  ])
  .describe(
    "The children property of the component. Can be 'none', for null elements such as images, 'text' for text elements, or 'dropzone' for nesting other elements."
  );

export type ChildrenType = z.infer<typeof ChildrenSchema>;

// Union type for possible children types as used in rendering
export type ChildProps = {
  children: "text" | "dropzone" | "none";
  childrenProps: any;
};

// Field configurations for each child type
export const childrenFields = {
  none: {},
  text: {
    value: {
      type: "textarea",
      label: "Children Text",
    },
  },
  dropzone: {
    allow: {
      type: "text",
      label: "Allow (comma separated)",
    },
    disallow: {
      type: "text",
      label: "Disallow (comma separated)",
    },
    style: {
      type: "array",
      label: "Style",
      getItemSummary: (item: any) => `${item.key}: ${item.value}`,
      arrayFields: {
        key: { type: "text", label: "Key" },
        value: { type: "text", label: "Value" },
      },
    },
    minEmptyHeight: {
      type: "number",
      label: "Minimum Empty Height",
      min: 0,
    },
    className: {
      type: "text",
      label: "Class Name",
    },
    collisionAxis: {
      type: "select",
      label: "Collision Axis",
      options: [
        { label: "X", value: "x" },
        { label: "Y", value: "y" },
        { label: "Dynamic", value: "dynamic" },
      ],
    },
  },
};
