import {
  AutoField,
  ComponentConfig,
  Field,
  Fields,
  PuckComponent,
  PuckContext,
  usePuck,
} from "@measured/puck";
import React, { isValidElement, useEffect } from "react";
import { DropzoneSchema } from "./dropzone.js";
import {
  ChildrenSchema,
  renderChild,
  childrenFields,
} from "../libs/child-manager.js";
import { ErrorBoundary } from "@workspace/blocks/libs/error-boundary.js";
import * as z from "zod";
import { JsonEditor } from "@workspace/ui/components/json-editor";

export const BaseSchema = z.object({
  properties: z.array(
    z.object({
      key: z.string(),
      valueType: z.enum(["string", "number", "boolean", "function", "json"]),
    })
  ),
  values: z
    .record(
      z.union([z.string(), z.number(), z.boolean(), DropzoneSchema, z.any()])
    )
    .optional(),
});

// Use the imported ChildrenSchema from child-manager
export const BaseComponentSchema = z.intersection(BaseSchema, ChildrenSchema);

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
      : /*{
          type: "custom",
          render: (p) => {
            let debounceTimer: ReturnType<typeof setTimeout>;
            const handleChange = (value: any) => {
              clearTimeout(debounceTimer);
              debounceTimer = setTimeout(() => {
                p.onChange(value);
              }, 600);
            };

            return (
              <AutoField
                field={{
                  type: "object",
                  objectFields: props.properties.reduce(
                    (acc, { key, valueType }) => {
                      if (!key) return acc;
                      (acc as any)[key] = createValueField(key, valueType);
                      return acc;
                    },
                    {}
                  ),
                }}
                id={p.id}
                value={p.value}
                onChange={handleChange}
              />
            );
          },
        } : */
        undefined,
  };
};

export const baseDefaultValue: BaseType = {
  properties: [
    { key: "id", valueType: "string" },
    { key: "style", valueType: "json" },
    {
      key: "dropzone",
      valueType: "string",
    },
  ],
  values: {
    id: "",
    style: {},
    children: "Hello World",
  },
};

const propsConstructor = (
  properties: BaseType["properties"],
  values: BaseType["values"]
) =>
  properties.reduce(
    (acc, { key, valueType }) => {
      const value = values?.[key];

      if (valueType === "function") {
        // TODO: Handle function type
      } else if (valueType === "json") {
        let parsedValue: any = value;
        try {
          parsedValue = JSON.parse(value as string);
        } catch (e) {
          console.log("Failed to parse JSON value:", e);
          parsedValue = undefined;
        }
        acc[key] = parsedValue;
      } else {
        acc[key] = value;
      }

      return acc;
    },
    {} as { [key: string]: any }
  );

export const baseComponentRender: PuckComponent<BaseComponentType> = ({
  element: Element,
  properties,
  values,
  children,
  childrenProps,
  puck,
  editMode,
  ...rest
}: BaseComponentType & {
  puck: PuckContext;
  id?: string;
  editMode?: boolean;
}) => {
  if (puck.isEditing) delete rest["id"];

  const props = propsConstructor(properties, values);

  const Component: any = Element;

  if (typeof Element !== "string" || !isValidElement(<Element />)) {
    return (
      <div
        ref={puck.dragRef}
        className="w-full flex items-center justify-center"
        style={{
          height: "128px",
        }}
      >
        Invalid element type
      </div>
    );
  }

  return (
    <ErrorBoundary
      resetKeys={[JSON.stringify(props)]}
      fallback={(error, resetError) => {
        return (
          <div
            ref={puck.dragRef}
            style={{
              height: "128px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "white",
              padding: "1rem",
              color: "#d32f2f",
            }}
          >
            <h3>{error.message}</h3>
          </div>
        );
      }}
    >
      {children === "none" ? (
        <Component {...props} {...rest} ref={puck.dragRef} />
      ) : (
        <Component {...props} {...rest} ref={puck.dragRef}>
          {renderChild({ children, childrenProps }, puck, "children", {
            style: values?.style,
            className: values?.className,
          })}
        </Component>
      )}
    </ErrorBoundary>
  );
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
