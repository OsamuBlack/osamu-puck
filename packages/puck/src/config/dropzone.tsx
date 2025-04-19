import React, { Fragment } from "react";
import { CSSProperties } from "react";
import { DropZone, PuckContext } from "@measured/puck";
import * as z from "zod";

// Dropzone schema definition
export const DropzoneSchema = z.object({
  zone: z.string(),
  allow: z.array(z.string()).optional(),
  disallow: z.array(z.string()).optional(),
  style: z
    .array(
      z.object({
        key: z.string(),
        value: z.string(),
      })
    )
    .optional(),
  minEmptyHeight: z.number().optional(),
  className: z.string().optional(),
  collisionAxis: z.enum(["x", "y", "dynamic"]).optional(),
});

// Type from the Zod schema
export type DropZoneProps = z.infer<typeof DropzoneSchema>;

// Union of the Zod type and the original prop type for backward compatibility
export type DropzoneBuilderProps = {
  dropzoneProperties: DropZoneProps;
  puck: PuckContext;
};

export const DropzoneBuilder = ({
  dropzoneProperties,
  puck,
}: DropzoneBuilderProps) => {
  const prop = dropzoneProperties;
  const { zone, minEmptyHeight, className } = prop;
  const style: CSSProperties | undefined = prop.style?.reduce(
    (acc, { key, value }) => {
      (acc as any)[key] = value;
      return acc;
    },
    {} as CSSProperties
  );

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

export default DropzoneBuilder;
