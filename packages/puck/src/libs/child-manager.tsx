import React, { Fragment, CSSProperties } from "react";
import { DropZone, PuckContext } from "@measured/puck";
import * as z from "zod";
import { cn } from "@workspace/ui/lib/utils";

// Type from the Zod schema
export type DropZoneProps = {
  allow?: string[] | undefined;
  disallow?: string[] | undefined;
  style?: CSSProperties | undefined;
  minEmptyHeight?: number | undefined;
  className?: string | undefined;
  collisionAxis?: "x" | "y" | "dynamic" | undefined;
}
// Union of the Zod type and the original prop type for backward compatibility
export type DropzoneBuilderProps = {
  zone: string;
  dropzoneProperties: DropZoneProps;
  puck: PuckContext;
};

export const DropZoneSchema = `type DropZoneProps = {
  allow?: string[] | undefined;
  disallow?: string[] | undefined;
  style?: CSSProperties | undefined;
  minEmptyHeight?: number | undefined;
  className?: string | undefined;
  collisionAxis?: "x" | "y" | "dynamic" | undefined;
}`;

// Dropzone Builder component (moved from dropzone.tsx)
export const DropzoneBuilder = ({
  zone,
  dropzoneProperties,
  puck,
}: DropzoneBuilderProps) => {
  const prop = dropzoneProperties;
  const { minEmptyHeight, className, style } = prop;

  return (
    <Fragment key={zone}>
      {!puck.isEditing && (
        <DropZone
          zone={zone}
          className={className}
          minEmptyHeight={minEmptyHeight}
          collisionAxis={prop.collisionAxis}
          style={style}
        />
      )}
      {
        puck.renderDropZone({
          zone,
          minEmptyHeight,
          className,
          style,
        }) as React.ReactNode
      }
    </Fragment>
  );
};

export type ChildrenType = {
  children: "none";
  element: string;
  childrenProps: {};
} | {
  children: "text";
  element: string;
  childrenProps: {
      value: string;
  };
} | {
  children: "dropzone";
  element: string;
  childrenProps: DropZoneProps;
}

export const ChildrenSchema = `type ChildrenType = {
  children: "none";
  element: string;
  childrenProps: {};
} | {
  children: "text";
  element: string;
  childrenProps: {
      value: string;
  };
} | {
  children: "dropzone";
  element: string;
  childrenProps: DropZoneProps;
}
`

// Union type for possible children types
export type ChildProps = {
  children: "text" | "dropzone" | "none";
  childrenProps: any;
};

// Child manager renders the appropriate child based on the type
export const renderChild = (
  props: ChildProps,
  puck: PuckContext,
  zone: string,
  {
    style,
    className,
  }: {
    style?: CSSProperties;
    className?: string;
  }
) => {
  if (props.children === "text") {
    return props.childrenProps?.value;
  } else if (props.children === "dropzone") {
    return (
      <DropzoneBuilder
        zone={zone}
        dropzoneProperties={{
          ...props.childrenProps,

          style: { ...style, ...props.childrenProps.style },
          className: cn(className, props.childrenProps.className),
        }}
        puck={puck}
      />
    );
  }
  return null;
};

// Define field configurations for each child type
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
