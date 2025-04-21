import { Data } from "@measured/puck";
import { generateId } from "../generateIds";

/**
 * Processes JSON content by replacing all numeric IDs with unique generated IDs.
 * Extracts all distinct IDs and replaces them consistently throughout the content.
 *
 * @param content - The JSON string containing numeric IDs
 * @returns The processed content with all numeric IDs replaced with unique IDs
 */
export function id(content: string): string {
  try {
    // Parse the JSON content
    const data = JSON.parse(content);

    // Extract all distinct IDs from the content
    const distinctIds = extractDistinctIds(data);

    // Generate unique IDs for each distinct ID
    const idMap = new Map<number, string>();
    Object.entries(distinctIds).forEach(([id, type]) => {
      idMap.set(Number(id), generateId(type));
    });

    // Replace all IDs in the content
    const updatedData = replaceIds(data, idMap);

    // Return the updated content as a JSON string
    return JSON.stringify(updatedData, null, 2);
  } catch (error) {
    console.error("Error processing IDs:", error);
    return content; // Return original content on error
  }
}

/**
 * Extracts all distinct IDs from a JSON object
 *
 * @param data - The JSON object to extract IDs from
 * @returns An array of distinct IDs
 */
function extractDistinctIds(data: Data): { [id: string]: string } {
  let ids: {
    [key: string]: string;
  } = {};

  const traverse = (obj: any) => {
    if (!obj || typeof obj !== "object") return;

    if (obj.id && typeof obj.id === "number") {
      ids[obj.id.toString()] = obj.type;
    }

    if (Array.isArray(obj)) {
      obj.forEach((item) => traverse(item));
    } else {
      Object.values(obj).forEach((value) => traverse(value));
    }
  };

  traverse(data);
  return ids;
}

/**
 * Replaces all IDs in a JSON object with generated IDs
 *
 * @param data - The JSON object to replace IDs in
 * @param idMap - A map of original IDs to generated IDs
 * @returns The JSON object with replaced IDs
 */
function replaceIds(data: any, idMap: Map<number, string>): any {
  if (!data || typeof data !== "object") return data;

  if (Array.isArray(data)) {
    return data.map((item) => replaceIds(item, idMap));
  }

  const result: any = {};

  for (const [key, value] of Object.entries(data)) {
    if ((key === "id" || key === "parentId") && typeof value === "number" && idMap.has(value)) {
      // Replace IDs in id, parentId, or parent fields
      result[key] = idMap.get(value);
    } else if (typeof value === "object") {
      result[key] = replaceIds(value, idMap);
    } else {
      result[key] = value;
    }
  }

  return result;
}
