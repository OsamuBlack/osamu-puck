import {
  AutoField,
  ComponentConfig,
  DragAxis,
  DropZone,
  Field,
  Fields,
  PuckComponent,
  PuckContext,
} from "@measured/puck";

export type ComponentType = {
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

export const ComponentFields = (
  props: ComponentType
): Fields<ComponentType> => {
  let field: any;

  switch (props.type) {
    case "text":
      field = { type: "text" };
      break;
    case "number":
      field = { type: "number" };
      break;
    case "radio (boolean)":
      field = { type: "radio", options: [{ label: "Yes", value: true }] };
      break;
    case "radio (number)":
      field = {
        type: "radio",
        options: [
          { label: "0", value: 0 },
          { label: "1", value: 1 },
        ],
      };
      break;
    case "select":
      field = {
        type: "select",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "optio2" },
        ],
      };
      break;
    case "object (number)":
      field = {
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
      break;
    case "object (string)":
      field = {
        type: "object",
        objectFields: {
          title: { type: "text" },
          description: { type: "textarea" },
        },
      };
      break;
    case "array":
      field = {
        type: "array",
        arrayFields: {
          test: { type: "text" },
        },
      };
      break;
    default:
      break;
  }

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
    field,
  };
};

export const ComponentRender: PuckComponent<ComponentType> = ({
  type,
  field,
  puck,
}: ComponentType & {
  puck: PuckContext;
}) => {
  return (
    <p>
      Field Type: {type}, Field: {JSON.stringify(field)}
    </p>
  );
};

export const ComponentDefaultValueString: ComponentType = {
  type: "text",
  field: "",
};

export const ComponentDefaultValueRadio: ComponentType = {
  // Default as a radio component (using radio (boolean))
  type: "radio (boolean)",
  field: false,
};

export const ComponentConfigRadio: ComponentConfig<ComponentType> = {
  label: "Component Default Radio",
  defaultProps: ComponentDefaultValueRadio,
  resolveFields(data) {
    const { type, field } = data.props;
    const fields = ComponentFields({ type, field });
    return fields;
  },
  render: ComponentRender,
};

export const ComponentDefaultValueObject: ComponentType = {
  // Default as an object component (using object (string))
  type: "object (string)",
  field: {
    title: "Hello",
    description: "World",
  },
};

export const ComponentConfigObject: ComponentConfig<ComponentType> = {
  label: "Component Default Object",
  defaultProps: ComponentDefaultValueObject,
  resolveFields(data) {
    const { type, field } = data.props;
    const fields = ComponentFields({ type, field });
    return fields;
  },
  render: ComponentRender,
};

export const ComponentConfigString: ComponentConfig<ComponentType> = {
  label: "Component Default String",
  defaultProps: ComponentDefaultValueString,

  resolveFields(data) {
    const { type, field } = data.props;

    data.props;

    const fields = ComponentFields({
      type,
      field,
    });
    return fields;
  },
  render: ComponentRender,
};

export const ComponentAutoFields = (
  props: ComponentType
): Fields<ComponentType> => {
  let field: any;

  switch (props.type) {
    case "text":
      field = { type: "text" };
      break;
    case "number":
      field = { type: "number" };
      break;
    case "radio (boolean)":
      field = { type: "radio", options: [{ label: "Yes", value: true }] };
      break;
    case "radio (number)":
      field = {
        type: "radio",
        options: [
          { label: "0", value: 0 },
          { label: "1", value: 1 },
        ],
      };
      break;
    case "select":
      field = {
        type: "select",
        options: [
          { label: "Option 1", value: "option1" },
          { label: "Option 2", value: "optio2" },
        ],
      };
      break;
    case "object (number)":
      field = {
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
      break;
    case "object (string)":
      field = {
        type: "object",
        objectFields: {
          title: { type: "text" },
          description: { type: "textarea" },
        },
      };
      break;
    case "array":
      field = {
        type: "array",
        arrayFields: {
          test: { type: "text" },
        },
      };
      break;
    default:
      break;
  }

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
            field={props.field}
            value={props.value}
            onChange={props.onChange}
          />
        );
      },
    },
  };
};

export const ComponentConfigAutoField: ComponentConfig<ComponentType> = {
  label: "Component AutoField",
  defaultProps: ComponentDefaultValueString,

  resolveFields(data) {
    const { type, field } = data.props;

    data.props;

    const fields = ComponentAutoFields({
      type,
      field,
    });
    return fields;
  },
  render: ComponentRender,
};