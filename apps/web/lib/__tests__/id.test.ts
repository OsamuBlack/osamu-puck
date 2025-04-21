/**
 * @jest-environment jsdom
 */
import { id } from "../snippets/id";
import { generateId } from "../generateIds";

// Mock the generateId function
jest.mock("../generateIds", () => ({
  generateId: jest.fn().mockImplementation((type) => {
    // Return predictable IDs for testing based on type
    if (type === "base") return "base-id";
    if (type === "card") return "card-id";
    return `${type || "default"}-${Math.random().toString(36).substring(2, 7)}`;
  })
}));

describe("id", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should replace numeric IDs with unique generated IDs based on type", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          { id: 1, type: "base", props: { element: "div" } },
          { id: 2, type: "card", props: { element: "div" } }
        ]
      }
    });

    const output = id(input);
    const parsed = JSON.parse(output);
    
    // Verify IDs were replaced with strings based on the component type
    expect(parsed.payload.content[0].id).toBe("base-id");
    expect(parsed.payload.content[1].id).toBe("card-id");
    
    // Verify generateId was called with the correct type arguments
    expect(generateId).toHaveBeenCalledTimes(2);
    expect(generateId).toHaveBeenCalledWith("base");
    expect(generateId).toHaveBeenCalledWith("card");
  });

  it("should maintain parent-child relationships when replacing IDs", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          { id: 1, type: "base", props: { element: "div" } },
          { id: 2, type: "card", parentId: 1, props: { element: "div" } }
        ]
      }
    });

    const output = id(input);
    const parsed = JSON.parse(output);
    
    // Verify parent-child relationship was maintained
    expect(parsed.payload.content[1].parentId).toBe(parsed.payload.content[0].id);
  });

  it("should not modify non-numeric IDs", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          { id: "already-string-id", type: "base" }
        ]
      }
    });

    const output = id(input);
    const parsed = JSON.parse(output);
    
    expect(parsed.payload.content[0].id).toBe("already-string-id");
    expect(generateId).not.toHaveBeenCalled();
  });

  it("should handle nested objects with IDs", () => {
    const input = JSON.stringify({
      payload: {
        content: [
          { 
            id: 1,
            type: "base",
            props: { 
              nestedObj: { id: 2, type: "nested" } 
            } 
          }
        ]
      }
    });

    const output = id(input);
    const parsed = JSON.parse(output);
    
    expect(parsed.payload.content[0].id).toBe("base-id");
    expect(generateId).toHaveBeenCalledWith("base");
  });

  it("should return original string if input is not valid JSON", () => {
    const input = '{ invalid json }';
    const output = id(input);
    expect(output).toBe(input);
    expect(generateId).not.toHaveBeenCalled();
  });
});
