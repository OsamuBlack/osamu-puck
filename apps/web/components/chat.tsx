"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { z } from "zod";
import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import { usePuck, type Data } from "@measured/puck";
import { toast } from "sonner";
import {
  RefreshCcw,
  Copy,
  Code,
  CircleStop,
  Clipboard,
  Loader2,
} from "lucide-react";
import { id } from "@/lib/snippets/id";
import { properties } from "@/lib/snippets/properties";
import { zones } from "@/lib/snippets/zones";
import { transformers } from "@/lib/snippets/transformers";
import { useUnsplashProcessor } from "./unsplash-processor";
import { processUnsplashImages } from "@/lib/snippets/unsplash";
import { puckSchema } from "@/app/(dashboard)/dashboard/puck/schema";

export default function ChatComponent({ path }: { path?: string }) {
  const [inputValue, setInputValue] = useState("");
  const [editedJson, setEditedJson] = useState("");
  const [showJsonPaste, setShowJsonPaste] = useState(false);
  const [pastedJson, setPastedJson] = useState("");
  const [isProcessingUnsplash, setIsProcessingUnsplash] = useState(false);
  const [justApplied, setJustApplied] = useState(false);
  const {
    dispatch,
    appState: { data: currentData },
  } = usePuck();

  useEffect(() => {
    if (justApplied) {
      setJustApplied(false);
    }
  }, [justApplied]);
  // Use the useObject hook for streaming structured data
  const { object, submit, isLoading, stop, error } = useObject({
    api: path ? path : "/api/generate/google",
    schema: puckSchema,
    // Add event callbacks
    onFinish({ object, error }) {
      if (object) {
        toast.success("Generated layout successfully!");
      }
      if (error) {
        toast.error("Failed to parse generated layout.");
        console.error("Parsing error:", error);
      }
    },
    onError(error) {
      toast.error("An error occurred during generation.");
      console.error("Generation error:", error);
    },
  });

  // Process the generated JSON through all converters
  const processGeneratedJson = (data: any) => {
    if (!data) return null;

    try {
      // Convert to string for processing
      let jsonString = JSON.stringify(data, null, 2);

      // Apply converters in sequence
      jsonString = id(jsonString);
      jsonString = transformers(jsonString);
      jsonString = zones(jsonString);

      return JSON.parse(jsonString);
    } catch (error) {
      console.error("Error processing JSON:", error);
      toast.error("Error processing generated layout");
      return data; // Return original on error
    }
  };

  // Common function to apply JSON data to Puck
  const applyJsonToPuck = (
    jsonData: any,
    successMessage: string = "Layout applied to editor!"
  ) => {
    try {
      // Process JSON through converters
      const processedData = processGeneratedJson(jsonData);

      setIsProcessingUnsplash(true);
      processUnsplashImages(processedData)
        .then((processedData: Data) => {
          // Apply to Puck
          dispatch({
            type: "setData",
            data: {
              ...processedData,
              root: currentData.root,
            } as Data,
          });
          setJustApplied(true);

          toast.success(successMessage);
        })
        .catch((error) => {
          toast.error(
            "Error processing Unsplash images. Please check your JSON."
          );
          console.error("Error processing Unsplash images:", error);
        })
        .finally(() => {
          setIsProcessingUnsplash(false);
        });

      return true;
    } catch (e) {
      console.error("Failed to apply JSON:", e);
      toast.error("Failed to apply JSON to editor");
      return false;
    }
  };

  // Apply the generated layout to the Puck editor
  const applyToPuck = () => {
    if (!object) return toast.info("No layout generated yet.");
    const result = puckSchema.safeParse(object);

    if (!result.success) {
      toast.error(
        "Invalid JSON schema. Generated layout doesn't match expected format."
      );
      console.error("Schema validation error:", result.error);
      return;
    }

    applyJsonToPuck(object);
  };

  // Copy JSON to clipboard
  const copyJsonToClipboard = () => {
    if (!object) return;

    try {
      // Process the generated JSON through all converters
      const processedData = processGeneratedJson(object);
      const jsonString = JSON.stringify(processedData, null, 2);
      navigator.clipboard.writeText(jsonString);
      toast.success("JSON copied to clipboard");
    } catch (e) {
      console.error("Failed to copy JSON:", e);
      toast.error("Failed to copy JSON to clipboard");
    }
  };

  // Apply JSON directly from clipboard
  const applyFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();

      // Validate if content exists
      if (!clipboardText.trim()) {
        return toast.error("Clipboard is empty");
      }

      // Parse the JSON
      const parsedData = JSON.parse(clipboardText);

      // Validate against schema
      const result = puckSchema.safeParse(parsedData);

      if (!result.success) {
        toast.error(
          "Invalid JSON schema. Clipboard content doesn't match expected format."
        );
        console.error("Schema validation error:", result.error);
        return;
      }

      applyJsonToPuck(
        parsedData,
        "Clipboard JSON validated and applied to editor!"
      );
    } catch (e) {
      console.error("Failed to apply clipboard JSON:", e);
      toast.error("Invalid JSON format in clipboard");
    }
  };

  // Handle editing JSON
  const handleEditJson = (value: string) => {
    setEditedJson(value);
  };

  // Apply edited JSON manually
  const applyEditedJson = () => {
    try {
      const parsedData = JSON.parse(editedJson);
      applyJsonToPuck(parsedData, "Custom JSON applied to editor!");
    } catch (error) {
      console.error("Error parsing JSON:", error);
      toast.error("Invalid JSON format. Please check your edits.");
    }
  };

  // Handle pasted JSON
  const applyPastedJson = () => {
    if (!pastedJson.trim()) {
      return toast.info("Please paste some JSON first");
    }

    try {
      const parsedData = JSON.parse(pastedJson);
      const success = applyJsonToPuck(
        parsedData,
        "Pasted JSON applied to editor!"
      );

      // Reset after applying
      if (success) {
        setPastedJson("");
        setShowJsonPaste(false);
      }
    } catch (e) {
      console.error("Failed to apply pasted JSON:", e);
      toast.error("Invalid JSON format. Please check your input.");
    }
  };

  // Handle generation button click
  const handleGeneration = () => {
    if (!inputValue.trim()) {
      return toast.info("Please enter a description to generate a layout.");
    }

    // Clear previous JSON and set loading state
    setEditedJson("");
    // dispatch({
    //   type: "setUi",
    //   ui: (prev) => ({ ...prev, previewMode: "interactive" }),
    // });

    submit({ prompt: inputValue });
  };

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-600">
          AI Layout Generator
        </Badge>
        {isLoading && (
          <Badge
            variant="outline"
            className="animate-pulse bg-amber-50 text-amber-600"
          >
            Generating...
          </Badge>
        )}
        {isProcessingUnsplash && (
          <Badge
            variant="outline"
            className="animate-pulse bg-purple-50 text-purple-600"
          >
            Processing Unsplash Images...
          </Badge>
        )}
      </div>

      <Separator />

      {/* Input area */}
      <div className="mb-4">
        <Textarea
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Describe the layout you want to create..."
          className="min-h-[100px]"
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.ctrlKey) {
              submit({ prompt: inputValue });
            }
          }}
        />
        <div className="flex justify-between mt-2">
          <div className="flex space-x-2">
            <Button
              onClick={handleGeneration}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
            >
              Generate Layout
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={applyFromClipboard}
              title="Apply JSON directly from clipboard"
            >
              <Clipboard className="size-4" />
            </Button>
            {/* <Button
              variant="outline"
              size="icon"
              onClick={() => setShowJsonPaste(!showJsonPaste)}
            >
              <Clipboard className="size-4" />
            </Button> */}
          </div>
          {isLoading && (
            <Button
              variant="outline"
              size="icon"
              onClick={stop}
              className="text-red-600 hover:text-red-700"
            >
              <CircleStop className="size-4" />
            </Button>
          )}
        </div>
      </div>

      {/* JSON Paste Area */}
      {showJsonPaste && (
        <div className="border rounded-md overflow-hidden mb-4">
          <div className="bg-muted px-4 py-2 font-medium text-sm">
            Paste JSON
          </div>
          <Textarea
            value={pastedJson}
            onChange={(e) => setPastedJson(e.target.value)}
            placeholder="Paste your JSON here..."
            className="min-h-[150px] border-0 focus-visible:ring-0"
          />
          <div className="bg-muted px-4 py-2 flex justify-end">
            <Button onClick={applyPastedJson} size="sm">
              Process & Apply
            </Button>
          </div>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
          <p className="font-medium">Error occurred</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Results area */}
      {object && (
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="font-medium text-green-700 mb-2">Layout Generated</p>
            {object.info && (
              <div className="mb-4 text-sm bg-white p-3 rounded border border-green-100">
                <p className="font-medium mb-1">AI Actions:</p>
                <p>{object.info}</p>
              </div>
            )}
            {isLoading ? (
              <div className="flex w-full justify-center items-center py-2 gap-2">
                Generating
                <Loader2 className="animate-spin size-4" />
              </div>
            ) : (
              <div className="flex space-x-2">
                <Button onClick={applyToPuck} size="sm" variant="default">
                  Apply to Editor
                </Button>
                <Button
                  onClick={copyJsonToClipboard}
                  size="icon"
                  variant="outline"
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            )}
          </div>

          {/* Unsplash Image Processing Status */}
          {isProcessingUnsplash && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-md">
              <div className="flex w-full justify-center items-center py-2 gap-2">
                <p className="font-medium text-purple-700">
                  Processing Unsplash Images
                </p>
                <Loader2 className="animate-spin size-4 text-purple-600" />
              </div>
              <p className="text-sm text-center text-purple-600">
                Downloading and optimizing images from Unsplash...
              </p>
            </div>
          )}

          {/* {editedJson && (
            <div className="border rounded-md overflow-hidden">
              <div className="bg-muted px-4 py-2 font-medium text-sm">
                Edit JSON
              </div>
              <div className="max-h-[300px] overflow-y-auto p-4">
                <JsonEditor
                  value={editedJson}
                  onChange={handleEditJson}
                  placeholder="JSON data will appear here..."
                />
              </div>
              <div className="bg-muted px-4 py-2 flex justify-end">
                <Button onClick={applyEditedJson} size="sm" variant="outline">
                  Apply Edited JSON
                </Button>
              </div>
            </div>
          )} */}
        </div>
      )}

      {/* Empty state */}
      {!object && !isLoading && !error && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">
              Enter a description above to generate a layout
            </p>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && !object && (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <RefreshCcw className="animate-spin" />
            </div>
            <p className="text-muted-foreground">
              Generating layout from your description...
            </p>
            <p className="text-sm text-muted-foreground">
              (This may take a few moments)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
