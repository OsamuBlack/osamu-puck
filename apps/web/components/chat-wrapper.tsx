"use client";

import ChatComponent from "./chat";
import { useUnsplashProcessor } from "./unsplash-processor";

/**
 * ChatWrapper extends the functionality of ChatComponent by
 * injecting the Unsplash processing capabilities.
 * This approach preserves the original ChatComponent while adding new functionality.
 */
export default function ChatWrapper() {
  // Initialize the Unsplash processor
  useUnsplashProcessor();
  
  // Just render the original ChatComponent
  return <ChatComponent />;
}
