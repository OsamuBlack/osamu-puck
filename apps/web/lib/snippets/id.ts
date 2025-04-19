import { generateId } from "../generateIds";

/**
 * Processes JSON content by replacing all instances of {generate snippet(n)} patterns
 * with actual unique UUIDs. Uses the number in generate snippet(n) as an index to a pre-generated
 * array of UUIDs, ensuring consistent replacements.
 *
 * @param content - The JSON string containing {generate snippet(n)} patterns
 * @returns The processed content with all patterns replaced with unique UUIDs
 */
export function id(content: string): string {
  const idMap = new Map<number, string>();

  const output = content.replace(/{id\((\d+)\)}/g, (match, numStr) => {
    const num = Number(numStr);
    if (!idMap.has(num)) {
      idMap.set(num, generateId());
    }
    return idMap.get(num)!;
  });

  return output;
}
