import { id } from "./snippets/id";
import { copy } from "./snippets/copy";
import { spread } from "./snippets/spread";
import { Data } from "@measured/puck";

/**
 * Processes Puck data object by replacing generate snippet patterns in all string properties
 * 
 * @param data - The Puck data object that may contain generate snippet patterns
 * @param prevData - The previous Puck data object for referencing existing values
 * @returns The processed data object with all patterns replaced
 */
export const processData = (data: any, prevData?: Data): any => {
  if (!data) return data;
  
  try {
    // Convert to string
    const stringified = JSON.stringify(data);
    
    // Updated pattern to match both number params and dot notation paths
    const hasSnippetPatterns = /{[a-zA-Z]+\((?:\d+|[a-zA-Z0-9_.]+)?\)}/.test(stringified);
    
    if (!hasSnippetPatterns) {
      return data; // No processing needed
    }
    
    // Process the string to replace generate snippet patterns
    let processed = id(stringified);
    processed = copy(processed, prevData || data); // Copy patterns using prevData if available
    processed = spread(processed, prevData || data); // Spread patterns using prevData if available
    
    try {
      // Parse the processed string back into an object
      return JSON.parse(processed);
    } catch (parseError) {
      console.error("Error parsing processed data:", parseError);
      // If we can't parse it, return the original data
      return data;
    }
  } catch (error) {
    console.error("Error in processData:", error);
    return data;
  }
};

// Add replaceId function for tests if it doesn't exist
export const replaceId = (str: string): string => {
  return id(str);
};
