/**
 * @jest-environment jsdom
 */
import { properties } from "../snippets/properties";

describe("properties", () => {
  it("should restructure property values into a values object", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          {
            id: 1,
            type: "base",
            props: {
              element: "div",
              properties: [
                {
                  key: "className",
                  valueType: "string",
                  value: "flex flex-col"
                },
                {
                  key: "style",
                  valueType: "json",
                  value: '{"color":"red"}'
                }
              ]
            }
          }
        ]
      }
    });

    const output = properties(input);
    const parsed = JSON.parse(output);

    // Check that the values object was created
    expect(parsed.payload.content[0].props.values).toBeDefined();
    // Check that values were correctly transferred
    expect(parsed.payload.content[0].props.values.className).toBe("flex flex-col");
    expect(parsed.payload.content[0].props.values.style).toBe('{"color":"red"}');
    // Check that values were removed from properties
    expect(parsed.payload.content[0].props.properties[0].value).toBeUndefined();
    expect(parsed.payload.content[0].props.properties[1].value).toBeUndefined();
  });

  it("should handle nested structure with multiple content items", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          {
            id: 1,
            type: "base",
            props: {
              element: "section",
              properties: [
                {
                  key: "id",
                  valueType: "string",
                  value: "section-1"
                }
              ]
            }
          },
          {
            id: 2,
            type: "base",
            parentId: 1,
            props: {
              element: "div",
              properties: [
                {
                  key: "className",
                  valueType: "string",
                  value: "container"
                }
              ]
            }
          }
        ]
      }
    });

    const output = properties(input);
    const parsed = JSON.parse(output);

    // Check all content items were processed
    expect(parsed.payload.content[0].props.values.id).toBe("section-1");
    expect(parsed.payload.content[1].props.values.className).toBe("container");
  });

  it("should return original content if no properties are found", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          {
            id: 1,
            type: "base",
            props: {
              element: "div",
              // No properties array
            }
          }
        ]
      }
    });

    const output = properties(input);
    // Should not modify the content as there are no properties
    expect(output).toBe(input);
  });

  it("should preserve properties without values", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          {
            id: 1,
            props: {
              element: "button",
              properties: [
                {
                  key: "disabled",
                  valueType: "boolean"
                  // No value property
                }
              ]
            }
          }
        ]
      }
    });

    const output = properties(input);
    const parsed = JSON.parse(output);

    // Property without value should be preserved
    expect(parsed.payload.content[0].props.properties[0].key).toBe("disabled");
    expect(parsed.payload.content[0].props.values).toEqual({});
  });
});
