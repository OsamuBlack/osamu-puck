"use client";

import { useState } from "react";
import { toast } from "sonner";
import { usePuck, type Data } from "@measured/puck";
import { puckSchema } from "@/app/(dashboard)/dashboard/single/schema";
import { id } from "@/lib/snippets/id";
import { zones } from "@/lib/snippets/zones";
import { transformers } from "@/lib/snippets/transformers";
import { processUnsplashImages, type UnsplashImage } from "@/lib/snippets/unsplash";
import { Button } from "@workspace/ui/components/button";
import { Copy } from "lucide-react";

/**
 * Return type for processor functions
 */
export type ProcessedResult = {
  data: any;
  images: UnsplashImage[];
};

/**
 * UnsplashProcessor provides utility functions to process JSON data through
 * all converters, including Unsplash image URL processing.
 */
export function useUnsplashProcessor() {
  const {
    dispatch,
    appState: { data: currentData },
  } = usePuck();

  /**
   * Process generated JSON through all converters, including Unsplash image URLs
   */
  const processGeneratedJson = async (data: any): Promise<ProcessedResult> => {
    if (!data) return { data: null, images: [] };

    try {
      // Convert to string for processing
      let jsonString = JSON.stringify(data, null, 2);

      // Apply string converters in sequence
      jsonString = id(jsonString);
      jsonString = transformers(jsonString);
      jsonString = zones(jsonString);

      // Parse back to object
      const parsedData = JSON.parse(jsonString);
      
      // Process Unsplash image URLs (server action)
      const { data: processedData, images } = await processUnsplashImages(parsedData);

      return { data: processedData, images };
    } catch (error) {
      console.error("Error processing JSON:", error);
      toast.error("Error processing generated layout");
      return { data, images: [] }; // Return original on error
    }
  };

  /**
   * Apply JSON data to Puck after processing
   */
  const applyJsonToPuck = async (
    jsonData: any,
    successMessage: string = "Layout applied to editor!"
  ): Promise<ProcessedResult> => {
    try {
      // Process JSON through converters
      const { data: processedData, images } = await processGeneratedJson(jsonData);

      // Apply to Puck
      // dispatch({
      //   type: "setData",
      //   data: {
      //     ...processedData,
      //     root: currentData.root,
      //   } as Data,
      // });

      toast.success(successMessage);
      return { data: processedData, images };
    } catch (e) {
      console.error("Failed to apply JSON:", e);
      toast.error("Failed to apply JSON to editor");
      return { data: null, images: [] };
    }
  };

  /**
   * Copy processed JSON to clipboard
   */
  const copyJsonToClipboard = async (data: any) => {
    if (!data) return;

    try {
      // Process the generated JSON through all converters
      const { data: processedData } = await processGeneratedJson(data);
      const jsonString = JSON.stringify(processedData, null, 2);
      navigator.clipboard.writeText(jsonString);
      toast.success("JSON copied to clipboard");
    } catch (e) {
      console.error("Failed to copy JSON:", e);
      toast.error("Failed to copy JSON to clipboard");
    }
  };

  // Validate and apply a JSON object to Puck
  const validateAndApplyToPuck = async (jsonData: any): Promise<ProcessedResult> => {
    const result = puckSchema.safeParse(jsonData);

    if (!result.success) {
      toast.error(
        "Invalid JSON schema. Layout doesn't match expected format."
      );
      console.error("Schema validation error:", result.error);
      return { data: null, images: [] };
    }

    return await applyJsonToPuck(jsonData);
  };

  return {
    processGeneratedJson,
    applyJsonToPuck,
    validateAndApplyToPuck,
    copyJsonToClipboard
  };
}

/**
 * ProcessedJsonActions component provides UI actions for processed JSON data
 */
export function ProcessedJsonActions({ data }: { data: any }) {
  const processor = useUnsplashProcessor();
  
  if (!data) return null;

  return (
    <div className="flex space-x-2">
      <Button 
        onClick={() => processor.validateAndApplyToPuck(data)} 
        size="sm" 
        variant="default"
      >
        Apply to Editor
      </Button>
      <Button
        onClick={() => processor.copyJsonToClipboard(data)}
        size="icon"
        variant="outline"
      >
        <Copy className="size-4" />
      </Button>
    </div>
  );
}
