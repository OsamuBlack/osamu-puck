/**
 * @jest-environment jsdom
 */ 
import { replaceId } from "../processSnippets";

describe("id", () => {
  it("should replace generateId patterns such that repeated indices produce same ID and different indices produce different IDs", () => {
    const input = '{"key": "{id(0)} and {id(0)} and {id(1)} and {id(1)}"}';
    const output = replaceId(input);
    // Use a regex with backreferences to capture and compare the IDs
    const match = output.match(/^\{"key": "([\w-]{36}) and \1 and ([\w-]{36}) and \2"\}$/);
    expect(match).not.toBeNull();
    // Ensure that the IDs for index 0 and index 1 are different.
    expect(match![1]).not.toEqual(match![2]);
  });

  it("should return the original string if no patterns are found", () => {
    const input = '{"key": "no snippets here"}';
    const output = replaceId(input);
    expect(output).toEqual(input);
  });
});

