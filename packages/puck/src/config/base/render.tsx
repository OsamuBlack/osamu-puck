"use client";

import React, { isValidElement } from "react";
import { PuckComponent, PuckContext } from "@measured/puck";
import { ErrorBoundary } from "@workspace/blocks/libs/error-boundary.js";
import { renderChild } from "../../libs/child-manager/config.js";
import { BaseComponentType, BaseType } from "./config.js";

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

  // Dropzone props check
  if (puck.isEditing) {
    delete rest["id"]
    if (children === "dropzone") {
      delete props["style"];
      delete props["className"];
    }
  };

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
            // To do, handle aboslute and fixed position
            style: values?.style,
            className: values?.className,
          })}
        </Component>
      )}
    </ErrorBoundary>
  );
};
