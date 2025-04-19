import { Data } from "@measured/puck";
import {get, merge, set} from "lodash"

/**
 * Parse spread path instructions from AI response text
 * 
 * @param text - The AI response text that may contain spread path instructions
 * @returns Array of dot notation paths to be merged
 */
export const parseSpreadInstructions = (text: string): string[] => {
  // Look for a pattern like: SPREAD_PATHS: path1, path2, path3
  const spreadMatch = text.match(/SPREAD_PATHS:\s*([^\n]+)/i);
  
  if (!spreadMatch) return [];
  
  // Split the paths and trim whitespace
  return spreadMatch[1]!
    .split(',')
    .map(path => path.trim())
    .filter(Boolean);
};

/**
 * Merge generated data with existing data based on spread paths
 * 
 * @param existingData - The current Puck data
 * @param generatedData - The AI-generated data
 * @param spreadPaths - Dot notation paths for targeted merging
 * @returns Merged data object
 */
export const mergeWithExistingData = (
  existingData: Data | null,
  generatedData: Data | null,
  spreadPaths: string[]
): Data => {
  // If no existing data or no spread paths, return generated data
  if (!existingData || !spreadPaths.length) {
    return generatedData || { content: [], zones: {}, root: {} };
  }
  
  // If no generated data, return existing data
  if (!generatedData) return existingData;
  
  // Create a deep copy of existing data to work with
  const result = JSON.parse(JSON.stringify(existingData)) as Data;
  
  // Process each spread path
  for (const path of spreadPaths) {
    if (!path) continue;
    
    // Get the value from the generated data
    const generatedValue = get(generatedData, path);
    
    if (generatedValue !== undefined) {
      // Get the existing value
      const existingValue = get(result, path);
      
      if (typeof existingValue === 'object' && typeof generatedValue === 'object') {
        if (Array.isArray(existingValue) && Array.isArray(generatedValue)) {
          // Concatenate arrays
          set(result, path, [...existingValue, ...generatedValue]);
        } else {
          // Merge objects
          const mergedValue = merge({}, existingValue, generatedValue);
          set(result, path, mergedValue);
        }
      } else {
        // Replace the value
        set(result, path, generatedValue);
      }
    }
  }
  
  return result;
};
