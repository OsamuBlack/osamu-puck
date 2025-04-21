"use client";

import React, { Fragment, CSSProperties } from "react";
import { DropZone, PuckContext } from "@measured/puck";
import { cn } from "@workspace/ui/lib/utils";
import { DropZoneProps, ChildProps } from "./config.js";

export const DropzoneBuilder = ({
  zone,
  dropzoneProperties,
  puck,
}: {
  zone: string;
  dropzoneProperties: DropZoneProps;
  puck: PuckContext;
}) => {
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
          style: { ...style, ...props.childrenProps?.style },
          className: cn(className, props.childrenProps?.className),
        }}
        puck={puck}
      />
    );
  }
  return null;
};
