import { Data } from "@measured/puck";

/**
 * Restructures properties by moving values from property objects to a values object
 * in the parent props object. Specifically targets content items.
 * 
 * @param content - The JSON string containing property objects
 * @returns The processed content with restructured properties
 */
export function properties(content: string): string {
  try {
    // Parse the JSON content
    const data = JSON.parse(content);
    
    // Only proceed if data has the expected structure
    if (!data || !Array.isArray(data.content)) {
      return content;
    }
    
    // Create a copy of the data to avoid mutating the original
    const updatedData = { ...data };
    
    // Process each content item
    updatedData.content = updatedData.content.map((item: any) => {
      // Skip items without props or properties
      if (!item.props || !item.props.properties || !Array.isArray(item.props.properties)) {
        return item;
      }
      
      // Create a deep copy of the item
      const updatedItem = { ...item };
      
      // Initialize the values object if it doesn't exist
      updatedItem.props = {
        ...updatedItem.props,
        values: updatedItem.props.values || {}
      };
      
      // Process each property
      for (const prop of updatedItem.props.properties) {
        // Skip if property doesn't have required fields
        if (!prop.key || !('value' in prop)) {
          continue;
        }
        
        // Add value to values object
        updatedItem.props.values[prop.key] = prop.value;
      }
      
      // Create new properties array without values
      updatedItem.props.properties = updatedItem.props.properties.map((prop: any) => {
        if ('value' in prop) {
          // Remove the value from the property
          const { value, ...propWithoutValue } = prop;
          return propWithoutValue;
        }
        return prop;
      });
      
      return updatedItem;
    });
    
    // Return the updated content as a JSON string
    return JSON.stringify(updatedData, null, 2);
  } catch (error) {
    console.error("Error processing properties:", error);
    return content; // Return original content on error
  }
}
