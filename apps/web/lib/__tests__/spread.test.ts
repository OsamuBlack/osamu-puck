/**
 * @jest-environment jsdom
 */
import { spread } from "../snippets/spread";
import { Data } from "@measured/puck";

describe("spread", () => {
  it("should replace spread patterns with actual object values from data", () => {
    const mockData = {
      styles: {
        button: {
          background: "#ff0000",
          padding: "1rem"
        }
      }
    };

    const input = '{"buttonStyle": {spread(styles.button)}}';
    const output = spread(input, mockData);
    expect(output).toBe('{"buttonStyle": {"background":"#ff0000","padding":"1rem"}}');
  });

  it("should handle nested objects when spreading values", () => {
    const mockData = {
      settings: {
        theme: {
          colors: {
            primary: "#ff0000"
          }
        }
      }
    };

    const input = '{"theme": {spread(settings.theme)}}';
    const output = spread(input, mockData);
    expect(output).toBe('{"theme": {"colors":{"primary":"#ff0000"}}}');
  });

  it("should return an empty object for undefined paths", () => {
    const mockData = {
      content: []
    };

    const input = '{"data": {spread(content.0)}}';
    const output = spread(input, mockData);
    expect(output).toBe('{"data": {}}');
  });

  it("should return the original string if no spread patterns are found", () => {
    const mockData = {
      test: "value"
    };

    const input = '{"key": "no patterns here"}';
    const output = spread(input, mockData);
    expect(output).toEqual(input);
  });

  it("should handle multiple spread patterns in one string", () => {
    const mockData = {
      styles: {
        button: {
          background: "#ff0000",
          padding: "1rem"
        },
        header: {
          height: "60px",
          color: "#000000"
        }
      }
    };

    const input = '{"buttonStyle": {spread(styles.button)}, "headerStyle": {spread(styles.header)}}';
    const output = spread(input, mockData);
    expect(output).toBe(
      '{"buttonStyle": {"background":"#ff0000","padding":"1rem"}, "headerStyle": {"height":"60px","color":"#000000"}}'
    );
  });
});