/**
 * Extracts children from content array and organizes them into a zones object
 * based on parent-child relationships while moving the id property into a props object.
 *
 * @param content - The JSON string containing parent-child relationships
 * @returns The processed content with zones structure
 */
export function zones(content: string): string {
  try {
    // Parse the JSON content
    const data = JSON.parse(content);

    // Only proceed if data has the expected structure
    if (!data || !Array.isArray(data.content)) {
      return content;
    }

    // Create a copy of the data to avoid mutating the original
    const updatedData = { ...data };

    // Prepare arrays and mappings for root items and children
    const rootContent: any[] = [];
    const childrenByParent: Record<string | number, any[]> = {};

    // Process each content item
    for (const item of updatedData.content) {
      // Destructure properties we want to change: parentId and id.
      // The rest of the properties are kept in rest.
      const { parentId, id, ...rest } = item;
      // Move the id property into a props object.
      const processedItem = {
        ...rest,
        props: {
          ...(item.props || {}),
          id,
        },
      };

      // If it's a child item, add it to childrenByParent.
      if (parentId !== undefined) {
        const parentKey = String(parentId) + ":" + (item.zoneName || "children");
        if (!childrenByParent[parentKey]) {
          childrenByParent[parentKey] = [];
        }
        childrenByParent[parentKey].push(processedItem);
      } else {
        // Otherwise, it's a root item.
        rootContent.push(processedItem);
      }
    }

    // Update the data structure with processed content and zones.
    updatedData.content = rootContent;
    updatedData.zones = { ...updatedData.zones, ...childrenByParent };

    // Return the updated content as a JSON string
    return JSON.stringify(updatedData, null, 2);
  } catch (error) {
    console.error("Error processing zones:", error);
    return content; // Return original content on error
  }
}
