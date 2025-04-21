import { AutoField, ComponentConfig, Field, Fields } from "@measured/puck";
import React from "react";
import {
  ChildrenSchema,
  childrenFields,
} from "../../libs/child-manager/config.js";
import * as z from "zod";
import { JsonEditor } from "@workspace/ui/components/json-editor";
import { baseComponentRender } from "./render.js";

export const BaseSchema = z.object({
  properties: z
    .array(
      z.object({
        key: z.string(),
        valueType: z.enum(["string", "number", "boolean", "function", "json"]),
      })
    )
    .describe("The keys of element attributes and their types"),
  values: z
    .record(z.union([z.string(), z.number(), z.boolean(), z.any()]))
    .optional()
    .describe(
      "The values of the properties. It can be a string, number, boolean, or any other type."
    ),
});

// Use the imported ChildrenSchema from child-manager
export const BaseComponentSchema = BaseSchema.and(ChildrenSchema).and(
  z.object({ element: z.string().describe("The HTML element type") })
);

export type BaseType = z.infer<typeof BaseSchema>;
export type BaseComponentType = z.infer<typeof BaseComponentSchema>;

const createValueField = (
  key: string,
  valueType: BaseType["properties"][number]["valueType"]
) => {
  switch (valueType) {
    case "string":
      return { type: "text", label: key } as Field<string>;
    case "number":
      return { type: "number", label: key } as Field<number>;
    case "boolean":
      return {
        type: "radio",
        label: key,
        options: [
          { label: "True", value: true },
          { label: "False", value: false },
        ],
      } as Field<boolean>;
    case "json":
      return {
        type: "custom",
        render({ onChange, value, id }) {
          // Memoize the value to prevent unnecessary re-renders
          const jsonValue = React.useMemo(() => {
            return typeof value === "string"
              ? value
              : JSON.stringify(value || {}, null, 2);
          }, [value]);

          // Memoize the onChange handler
          const handleChange = React.useCallback(
            (newValue: string) => {
              onChange(newValue);
            },
            [onChange]
          );

          return (
            <JsonEditor value={jsonValue} onChange={handleChange} label={key} />
          );
        },
      } as Field<string>;
    case "function":
      return { type: "text", label: `${key} Function name` } as Field<string>;
    default:
      return undefined;
  }
};

export const baseFields = (props: BaseType): Fields<BaseType> => {
  const { properties } = props;

  return {
    properties: {
      type: "array",
      getItemSummary: (item, index) =>
        item.key
          ? `${item.key}: ${item.valueType}`
          : `Property ${(index || 0) + 1}`,
      defaultItemProps: {
        key: "dataX",
        valueType: "string",
      },
      arrayFields: {
        key: { type: "text" },
        valueType: {
          type: "select",
          options: [
            { label: "string", value: "string" },
            { label: "number", value: "number" },
            { label: "boolean", value: "boolean" },
            { label: "function", value: "function" },
            { label: "json", value: "json" },
            { label: "Dropzone", value: "dropzone" },
          ],
        },
      },
    },
    values: properties.length
      ? {
          type: "object",
          objectFields: props.properties.reduce((acc, { key, valueType }) => {
            if (!key) return acc;
            (acc as any)[key] = createValueField(key, valueType);
            return acc;
          }, {}),
        }
      : undefined,
  };
};

export const baseDefaultValue: BaseType = {
  properties: [
    { key: "className", valueType: "string" },
  ],
  values: {
    className: "",
  },
};

export const BaseComponentConfig: ComponentConfig<BaseComponentType> = {
  label: "Base Component",
  defaultProps: {
    element: "div",
    children: "text",
    childrenProps: { value: "Hello" },
    ...baseDefaultValue,
  },
  inline: true,
  resolveFields(data) {
    const { properties, values, children } = data.props;

    const fields = {
      element: {
        type: "text",
        label: "Element",
      },
      ...baseFields({
        properties,
        values,
      }),
      children: {
        label: "Children",
        type: "radio",
        options: [
          { label: "Text", value: "text" },
          { label: "Dropzone", value: "dropzone" },
          { label: "None", value: "none" },
        ],
      },
      childrenProps: {
        type: "object",
        label: "Children Props",
        objectFields: childrenFields[children],
      },
    } as Fields<BaseComponentType>;
    return fields;
  },
  render: baseComponentRender,
};
