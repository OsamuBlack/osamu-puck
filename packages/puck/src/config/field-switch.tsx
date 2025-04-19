import {
  AutoField,
  ComponentConfig,
  ComponentData,
  Field,
  Fields,
  PuckComponent,
  PuckContext,
} from "@measured/puck";

export type ComponentSimpleType = {
  type:
    | "text"
    | "number"
    | "radio (boolean)"
    | "radio (number)"
    | "select"
    | "object (number)"
    | "object (string)"
    | "array";
  field:
    | string
    | number
    | boolean
    | {
        x: number;
        y: number;
      }
    | {
        title: string;
        description: string;
      }
    | string[];
};

const fieldGenerator = (type: ComponentSimpleType['type']): Field => {
  switch (type) {
    case "text":
      return { type: "text" };
    case "number":
      return { type: "number" };
    case "radio (boolean)":
      return { type: "radio", options: [{ label: "Yes", value: true }] };
    case "radio (number)":
      return {
        type: "radio",
        options: [
          { label: "0", value: 0 },
          { label: "1", value: 1 },
        ],
      };
    case "select":
      return {
        type: "select",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "optio2" },
        ],
      };
    case "object (number)":
      return {
        type: "object",
        objectFields: {
          x: {
            type: "number",
          },
          y: {
            type: "number",
          },
        },
      };
    case "object (string)":
      return {
        type: "object",
        objectFields: {
          title: { type: "text" },
          description: { type: "textarea" },
        },
      };
    case "array":
      return {
        type: "array",
        arrayFields: {
          test: { type: "text" },
        },
      };
    default:
      return { type: "text" };
  }
};

export const ComponentFields = (
  props: ComponentSimpleType
): Fields<ComponentSimpleType> => {
  let field = fieldGenerator(props.type);

  return {
    type: {
      label: "Field Type",
      type: "radio",
      options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Radio (Boolean)", value: "radio (boolean)" },
        { label: "Radio (Number)", value: "radio (number)" },
        { label: "Select", value: "select" },
        { label: "Object (number)", value: "object (number)" },
        { label: "Object (string)", value: "object (string)" },
        { label: "Array", value: "array" },
      ],
    },
    field,
  };
};

export const ComponentRender: PuckComponent<ComponentSimpleType> = ({
  type,
  field,
  puck,
}: ComponentSimpleType & {
  puck: PuckContext;
}) => {
  return (
    <p>
      Field Type: {type}, Field: {JSON.stringify(field)}
    </p>
  );
};

export const ComponentDefaultValue: ComponentSimpleType = {
  type: "text",
  field: "",
};

export const ComponentSimpleConfig: ComponentConfig<ComponentSimpleType> = {
  label: "Simple Component",
  defaultProps: ComponentDefaultValue,
  resolveFields(data) {
    const { type, field } = data.props;
    const fields = ComponentFields({ type, field });
    return fields;
  },
  resolveData: resolveDefaultData,
  render: ComponentRender,
};

export const ComponentAutoFields = (
  props: ComponentSimpleType
): Fields<ComponentSimpleType> => {
  let field = fieldGenerator(props.type);

  return {
    type: {
      label: "Field Type",
      type: "radio",
      options: [
        { label: "Text", value: "text" },
        { label: "Number", value: "number" },
        { label: "Radio (Boolean)", value: "radio (boolean)" },
        { label: "Radio (Number)", value: "radio (number)" },
        { label: "Select", value: "select" },
        { label: "Object", value: "object" },
        { label: "Array", value: "array" },
      ],
    },
    field: {
      type: "custom",
      render(props) {
        return (
          <AutoField
            field={field}
            value={props.value}
            onChange={props.onChange}
          />
        );
      },
    },
  };
};

export const ComponentConfigAutoField: ComponentConfig<ComponentSimpleType> = {
  label: "Component AutoField",
  defaultProps: ComponentDefaultValue,

  resolveFields(data) {
    const { type, field } = data.props;

    data.props;

    const fields = ComponentAutoFields({
      type,
      field,
    });
    return fields;
  },
  resolveData: resolveDefaultData,
  render: ComponentRender,
};

export function resolveDefaultData(
  data: Omit<ComponentData<ComponentSimpleType>, "type">,
  params: {
    changed: Partial<Record<keyof ComponentSimpleType, boolean>>;
    lastData: Omit<ComponentData<ComponentSimpleType>, "type"> | null;
  }
) {
  if (params.changed.type) {
    switch (data.props.type) {
      case "text":
        data.props.field = "";
        break;
      case "number":
        data.props.field = 0;
        break;
      case "radio (boolean)":
        data.props.field = false;
        break;
      case "radio (number)":
        data.props.field = 0;
        break;
      case "select":
        data.props.field = "option1";
        break;
      case "object (number)":
        data.props.field = { x: 0, y: 0 };
        break;
      case "object (string)":
        data.props.field = { title: "", description: "" };
        break;
      case "array":
        data.props.field = [""];
        break;
      default:
        data.props.field = "";
        break;
    }
  }
  return data;
}

// Nested

export type ComponentNestedType = {
  properties: {
    type: ComponentSimpleType["type"];
    label: string;
  }[];
  field: {
    [key: string]: ComponentSimpleType["field"];
  };
};

export const ComponentNestedFields = (
  props: ComponentNestedType
): Fields<ComponentNestedType> => {
  return {
    properties: {
      label: "Field Type",
      type: "array",
      arrayFields: {
        type: {
          label: "Field Type",
          type: "radio",
          options: [
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Radio (Boolean)", value: "radio (boolean)" },
            { label: "Radio (Number)", value: "radio (number)" },
            { label: "Select", value: "select" },
            { label: "Object (number)", value: "object (number)" },
            { label: "Object (string)", value: "object (string)" },
            { label: "Array", value: "array" },
          ],
        },
        label: {
          label: "Label",
          type: "text",
        },
      },
    },
    field: {
      type: "object",
      objectFields: props.properties.reduce(
        (acc, { label, type }) => {
          (acc as any)[label] = fieldGenerator(type);
          return acc;
        },
        {}
      ),
    },
  };
};

export const ComponentNestedDefaultValue: ComponentNestedType = {
  properties: [
    { type: "text", label: "Text" },
    { type: "number", label: "Number" },
  ],
  field: {
    Text: "",
    Number: 0,
  },
};

export function resolveNestedData(
  data: Omit<ComponentData<ComponentNestedType>, "type">,
  params: {
    changed: Partial<Record<keyof ComponentNestedType, boolean>>;
    lastData: Omit<ComponentData<ComponentNestedType>, "type"> | null;
  }
) {
  if (params.changed.properties) {
    if (params.changed.properties) {
      const { properties } = data.props;
      // Switch field to an object and set default values for each property based on its type.
      data.props.field = properties.reduce((acc, { label, type }) => {
        switch (type) {
          case "text":
            (acc as any)[label] = "";
            break;
          case "number":
            (acc as any)[label] = 0;
            break;
          case "radio (boolean)":
            (acc as any)[label] = false;
            break;
          case "radio (number)":
            (acc as any)[label] = 0;
            break;
          case "select":
            (acc as any)[label] = "option1";
            break;
          case "object (number)":
            (acc as any)[label] = { x: 0, y: 0 };
            break;
          case "object (string)":
            (acc as any)[label] = { title: "", description: "" };
            break;
          case "array":
            (acc as any)[label] = [""];
            break;
          default:
            (acc as any)[label] = "";
            break;
        }
        return acc;
      }, {});
    }
  }
  return data;
}

export const ComponentNestedRender: PuckComponent<ComponentNestedType> = ({
  properties,
  field,
  puck,
}: ComponentNestedType & {
  puck: PuckContext;
}) => {
  return (
    <div>
      {properties.map(({ label, type }) => {
        return (
          <div key={label}>
            <p>{label}</p>
            <p>{type}</p>
          </div>
        );
      })}
      <p>Field: {JSON.stringify(field)}</p>
    </div>
  );
}

export const ComponentNestedConfig: ComponentConfig<ComponentNestedType> = {
  label: "Component Nested",
  defaultProps: ComponentNestedDefaultValue,
  resolveFields(data) {
    const { properties, field } = data.props;
    const fields = ComponentNestedFields({ properties, field });
    return fields;
  },
  resolveData: resolveNestedData,
  render: ComponentNestedRender,
};

// Similar to the above, but with AutoField for the field property
export const ComponentNestedAutoFields = (
  props: ComponentNestedType
): Fields<ComponentNestedType> => {
  return {
    properties: {
      label: "Field Type",
      type: "array",
      arrayFields: {
        type: {
          label: "Field Type",
          type: "radio",
          options: [
            { label: "Text", value: "text" },
            { label: "Number", value: "number" },
            { label: "Radio (Boolean)", value: "radio (boolean)" },
            { label: "Radio (Number)", value: "radio (number)" },
            { label: "Select", value: "select" },
            { label: "Object (number)", value: "object (number)" },
            { label: "Object (string)", value: "object (string)" },
            { label: "Array", value: "array" },
          ],
        },
        label: {
          label: "Label",
          type: "text",
        },
      },
    },
    field: {
      type: "custom",
      render(p) {
        let debounceTimer: ReturnType<typeof setTimeout>;
        const handleChange = (value: any) => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            p.onChange(value);
          }, 300);
        }

        return (
          <AutoField
            field={{
              type: "object",
              objectFields: props.properties.reduce((acc, { label, type }) => {
                (acc as any)[label] = fieldGenerator(type);
                return acc;
              }, {}),
            }}
            value={p.value}
            onChange={handleChange}
          />
        );
      },
    }
  };
}

export const ComponentNestedAutoFieldsConfig: ComponentConfig<ComponentNestedType> = {
  label: "Component Nested AutoField",
  defaultProps: ComponentNestedDefaultValue,
  resolveFields(data) {
    const { properties, field } = data.props;
    const fields = ComponentNestedAutoFields({ properties, field });
    return fields;
  },
  resolveData: resolveNestedData,
  render: ComponentNestedRender,
};