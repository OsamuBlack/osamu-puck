import { ComponentConfig, Fields } from "@measured/puck";
import { Button } from "@workspace/ui/components/button";
import * as z from "zod";
import { baseFields, BaseSchema } from "./base.js";

// Define schema for button component
export const ButtonSchema = z.object({
  variant: z
    .enum(["default", "destructive", "outline", "secondary", "ghost", "link"])
    .optional(),
  size: z.enum(["default", "sm", "lg", "icon"]).optional(),
  asChild: z.boolean().optional(),
  children: z.string().optional(),
});

export const ButtonDerivedSchema = z.intersection(ButtonSchema, BaseSchema);

export type ButtonType = z.infer<typeof ButtonDerivedSchema>;

// Generate fields from schema
export const buttonFields = (props: ButtonType): Fields<ButtonType> => ({
  variant: {
    type: "select" as const,
    options: [
      { label: "Default", value: "default" },
      { label: "Destructive", value: "destructive" },
      { label: "Outline", value: "outline" },
      { label: "Secondary", value: "secondary" },
      { label: "Ghost", value: "ghost" },
      { label: "Link", value: "link" },
    ],
  },
  size: {
    type: "radio" as const,
    options: [
      { label: "Default", value: "default" },
      { label: "Small", value: "sm" },
      { label: "Large", value: "lg" },
      { label: "Icon", value: "icon" },
    ],
  },
  asChild: {
    type: "radio" as const,
    options: [
      { label: "Yes", value: true },
      { label: "No", value: false },
    ],
  },
  ...baseFields({
    properties: props.properties,
    values: props.values,
  }),
});

// Default values for button
export const buttonDefaultValue: ButtonType = {
  variant: "default",
  size: "default",
  asChild: false,
  children: "Button",
  properties: [],
};

// Render function for button component
export const buttonRender = ({
  puck,
  id,
  fields,
  children,
}: {
  puck: any;
  id?: string;
  editMode?: boolean;
  fields: ButtonType;
  children?: React.ReactNode;
}) => {
  return (
    <Button
      variant={fields.variant}
      size={fields.size}
      asChild={fields.asChild}
      ref={puck?.dragRef}
    >
      {children || fields.children}
    </Button>
  );
};

export const ButtonConfig: ComponentConfig<ButtonType> = {
  label: "Button",
  resolveFields(data) {
    return buttonFields(data.props);
  },
  defaultProps: buttonDefaultValue,
  render: ({ puck, id, editMode, ...props }) =>
    buttonRender({
      puck,
      id,
      editMode,
      fields: props,
      children: props.children,
    }),
};
