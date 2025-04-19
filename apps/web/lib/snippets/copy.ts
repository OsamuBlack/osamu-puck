import { Data } from "@measured/puck";

/**
 * Gets the value at a specific path in an object using dot notation
 * Handles special characters like colons in path segments
 */
const getValueByPath = (obj: any, path: string): any => {
  // Split the path but preserve segments with colons
  const segments = path.match(/[^.]+/g) || [];
  
  return segments.reduce((o, key) => {
    // Handle undefined or null objects
    if (o === undefined || o === null) return undefined;
    return o[key];
  }, obj);
};

/**
 * Replaces copy(path) patterns with the value at the specified path
 * 
 * @param input - The string containing copy patterns
 * @param data - The source data object (current or previous Puck data) to copy from
 * @returns The string with copy patterns replaced with actual values
 */
export const copy = (input: string, data: Data | any): string => {
  if (!data) return input;

  // Pattern to match copy(path.to.property) with support for colons in zone keys
  const copyPattern = /{copy\(([a-zA-Z0-9_.:]+)\)}/g;
  
  return input.replace(copyPattern, (match, path) => {
    const value = getValueByPath(data, path);
    
    // Convert to string or return empty string if undefined
    return value !== undefined ? 
      (typeof value === 'object' ? JSON.stringify(value) : String(value)) : 
      '';
  });
};
