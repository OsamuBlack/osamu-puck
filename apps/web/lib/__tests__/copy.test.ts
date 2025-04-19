/**
 * @jest-environment jsdom
 */
import { copy } from "../snippets/copy";
import { Data } from "@measured/puck";

describe("copy", () => {
  it("should replace copy patterns with actual values from data", () => {
    const mockData: Data = {
      content: [
        {
          type: "card",
          props: {
            title: "Test Title",
            description: "Test Description",
            id: "card-1"
          }
        }
      ],
      zones: {
        "card-1:content": [
          {
            type: "text",
            props: {
              content: "Sample Text",
              id: "text-1"
            }
          }
        ]
      },
      root: {}
    };

    const input = '{"title": "{copy(content.0.props.title)}", "text": "{copy(zones.card-1:content.0.props.content)}"}';
    const output = copy(input, mockData);
    expect(output).toBe('{"title": "Test Title", "text": "Sample Text"}');
  });

  it("should handle nested objects when copying values", () => {
    const mockData = {
      settings: {
        theme: {
          colors: {
            primary: "#ff0000"
          }
        }
      }
    };

    const input = '{"color": "{copy(settings.theme.colors.primary)}"}';
    const output = copy(input, mockData);
    expect(output).toBe('{"color": "#ff0000"}');
  });

  it("should convert object values to JSON strings", () => {
    const mockData = {
      styles: {
        button: {
          background: "#ff0000",
          padding: "1rem"
        }
      }
    };

    const input = '{"buttonStyle": {copy(styles.button)}}';
    const output = copy(input, mockData);
    expect(output).toBe('{"buttonStyle": {"background":"#ff0000","padding":"1rem"}}');
  });

  it("should return empty string for undefined paths", () => {
    const mockData = {
      content: []
    };

    const input = '{"title": "{copy(content.0.props.title)}"}';
    const output = copy(input, mockData);
    expect(output).toBe('{"title": ""}');
  });

  it("should return the original string if no patterns are found", () => {
    const mockData = {
      content: [{ props: { title: "Test" } }]
    };

    const input = '{"key": "no patterns here"}';
    const output = copy(input, mockData);
    expect(output).toEqual(input);
  });
});
