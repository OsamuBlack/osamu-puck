When you are generting a snippet processor for the chat-interface, keep following things in mind:

1. The snippet follows {snippetName(undefined | number | string)}.
2. Generate tests fro the snippet
3. The snippet will act on the puck Data type:
```
{
  "root": {
    "props": {
      title: "Page Title",
    }
  },
  "content": [
    {
      "type": "ComponentName",
      "props": {
        ...,
        "id": "<generated according to ID rules>"
      }
    }
  ],
  "zones": {
    "<zone-key>": [ 
      { "type": "ComponentName", "props": { ... } }
    ]
  }
}
```