import { Data } from "@measured/puck";
import {
  objectToBase,
  objectToButton,
  objectToTypography,
  objectToCard,
} from "@workspace/puck/transformers/";

/**
 * Restructures properties by moving values from property objects to a values object
 * in the parent props object. Specifically targets content items.
 *
 * @param content - The JSON string containing property objects
 * @returns The processed content with restructured properties
 */
export function transformers(content: string): string {
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
      if (!Array.isArray(item.props) || item.props.length === 0) {
        return item;
      }

      // Determine the component type
      const componentType = item.type;
      let transformedComponent;

      // Apply the appropriate transformer based on component type
      switch (componentType) {
        case "button":
          transformedComponent = objectToButton({
            props: item.props,
            slots: item.slots || [],
          });
          break;
        case "typography":
          transformedComponent = objectToTypography({
            props: item.props,
            slots: item.slots || [],
          });
          break;
        case "card":
          transformedComponent = objectToCard({
            props: item.props,
            slots: item.slots || [],
          });
          break;
        default:
          transformedComponent = objectToBase({
            props: item.props,
            slots: item.slots || [],
          });
      }

      delete item.slots;

      // Create a new item with the transformed properties
      return {
        ...item,
        props: transformedComponent,
      };
    });

    // Return the updated content as a JSON string
    return JSON.stringify(updatedData, null, 2);
  } catch (error) {
    console.error("Error processing properties:", error);
    return content; // Return original content on error
  }
}
