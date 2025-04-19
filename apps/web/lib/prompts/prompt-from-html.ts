const promptFromHtml: string = `
TypeScript Type DefinitionBased on the JSON structure, here's a possible TypeScript type definition:interface Root {
  title: string;
}

interface Property {
  key: string;
  valueType: 'string' | 'number' | 'boolean' | 'function' | 'json';
}

interface Base {
  type: 'base';
  props: {
    id: string; // type + unique number, will be used in zones
    properties: Property[];
    values: { [key: string]: string | number | boolean }; 
    children: 'dropzone' | 'text' | 'none';
    element: string;
    childrenProps: ChildrenProps | { value: string };
  };
}

type ContentItem = Base;

interface Zones {
  [key: string]: ContentItem[]; // where key is the parent component id + :children
}

interface JSONData {
  root: Root;
  content: ContentItem[];
  zones: Zones;
}
Prompt for Content GenerationHere's a prompt to generate content, with a placeholder for HTML:Prompt:"Generate a JSON object representing the following HTML structure, styled with Tailwind CSS.  The JSON object should conform to the provided TypeScript type definition. Use 'dropzone' to denote areas where child elements can be placed, 'text' for text content, and 'none' for elements without children.  Ensure that the className, src, alt, width, and height properties are correctly captured within the 'values' object.[HTML_CONTENT_HERE]
\`\`\`"

**Explanation of the prompt:**

* It instructs the model to generate JSON from HTML.
* It specifies that the JSON must follow the provided TypeScript type.
* It defines how to handle element children and their properties.
`