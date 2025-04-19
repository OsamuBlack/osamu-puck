# Shadcn AI-Powered Editor

A powerful drag-and-drop web interface builder enhanced with AI assistance. Design beautiful, responsive layouts quickly using natural language instructions and a visual editor.

## Features

- **AI-Powered Layout Generation**: Create components and layouts using natural language prompts
- **Visual Drag-and-Drop Editor**: Built on [Puck Editor](https://github.com/measuredco/puck)
- **Component Library**: Integrated with [shadcn/ui](https://ui.shadcn.com/) components

## What's in the Packages

This monorepo contains:

- **apps/web**: Main application with the AI-powered editor
  - `components/`: Reusable UI components
  - `lib/`: Utility functions and processing logic
  - `lib/snippets/`: Dynamic content pattern processors
- **packages/ui**: Shared UI component library based on shadcn/ui
- **packages/puck**: Extensions and configurations for the Puck editor

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/shadcn-monorepo.git
   cd shadcn-monorepo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Using the AI Assistant

1. Configure your Google AI API key in the settings panel
2. Type a natural language description of what you want to build
3. Review the generated layout
4. Apply changes to the editor
5. Fine-tune with the drag-and-drop interface

## To-Do

- [ ] Add more pre-built component templates
- [ ] Improve mobile responsiveness handlers
- [ ] Enhance AI prompt templates for better generations
- [ ] Add real-time collaboration features
- [ ] Create more comprehensive tests for snippet processors
- [ ] Add documentation site with examples
- [ ] Support for theme customization
- [ ] Export options for generated layouts

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
