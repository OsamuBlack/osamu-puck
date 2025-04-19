#!/usr/bin/env node

const { processData } = require('../lib/processSnippets');

// Example Puck data with generateId patterns
const testData = {
  content: [
    {
      type: "base",
      props: {
        element: "h1",
        children: "text",
        id: "base-{generateId(1)}"
      }
    },
    {
      type: "base",
      props: {
        element: "div",
        children: "dropzone",
        id: "base-{generateId(2)}"
      }
    }
  ],
  zones: {
    "base-{generateId(2)}:children": [
      {
        type: "card",
        props: {
          title: "Card in a zone",
          id: "card-{generateId(3)}"
        }
      }
    ]
  }
};

// Process the data
console.log("Original data:");
console.log(JSON.stringify(testData, null, 2));

console.log("\nProcessed data:");
const processed = processData(testData);
console.log(JSON.stringify(processed, null, 2));

// Verify that relationships are maintained
console.log("\nVerifying zone relationships:");
const baseId = processed.content[1].props.id;
const expectedZoneKey = `${baseId}:children`;

if (processed.zones[expectedZoneKey]) {
  console.log("✅ Success: Zone relationship is maintained");
  console.log(`Component ID: ${baseId}`);
  console.log(`Zone key: ${expectedZoneKey}`);
} else {
  console.log("❌ Error: Zone relationship is broken");
  console.log(`Expected to find zone key: ${expectedZoneKey}`);
  console.log(`Available zone keys: ${Object.keys(processed.zones)}`);
}
