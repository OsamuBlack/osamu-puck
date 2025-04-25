"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { usePuck, type Data } from "@measured/puck";
import { toast } from "sonner";
import {
  RefreshCcw,
  Copy,
  Code,
  CircleStop,
  Clipboard,
  Loader2,
  SendHorizonal,
} from "lucide-react";
import { id } from "@/lib/snippets/id";
import { properties } from "@/lib/snippets/properties";
import { zones } from "@/lib/snippets/zones";
import { transformers } from "@/lib/snippets/transformers";
import { useUnsplashProcessor } from "./unsplash-processor";
import { processUnsplashImages } from "@/lib/snippets/unsplash";
import { puckSchema } from "@/app/(dashboard)/dashboard/puck/schema";
import { agentSchema } from "@/schema/agent";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Card, CardContent } from "@workspace/ui/components/card";
import { useRouter } from "next/navigation";

export default function ChatComponent({ path, prompt }: { path?: string, prompt?: string }) {
  const [inputValue, setInputValue] = useState("");
  const [isProcessingUnsplash, setIsProcessingUnsplash] = useState(false);
  const router = useRouter();
  const [justApplied, setJustApplied] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const {
    dispatch,
    appState: { data: currentData },
  } = usePuck();

  console.log(prompt)

  useEffect(() => {
    if (justApplied) {
      setJustApplied(false);
    }
  }, [justApplied]);

  // Add effect to handle initial prompt
  useEffect(() => {
    if (prompt) {
      const urlDecoded = decodeURIComponent(prompt);
      setInputValue(urlDecoded);
      // Use a small timeout to ensure state is updated before submitting
      const timer = setTimeout(() => {
        submit({ prompt: urlDecoded });
      }, 100);
      return () => clearTimeout(timer);
    }
  }, []);

  // Use the useObject hook for agent response
  const { object, submit, isLoading, stop, error } = useObject({
    api: path ? path : "/api/agent/google",
    schema: agentSchema,
    // Add event callbacks
    onFinish({ object, error }) {
      if (object) {
        toast.success("Generated response successfully!");
        // Reset answers when we get a new object
        setAnswers({});
      }
      if (error) {
        toast.error("Failed to parse generated response.");
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

  // 1. Handle initial agent request - First step in the flow
  const handleAgent = () => {
    if (!inputValue.trim()) {
      return toast.info("Please enter a description to generate a layout.");
    }

    // Reset answers when starting a new request
    setAnswers({});
    submit({ prompt: inputValue });
  };

  // Handle answer changes for questions
  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // 2. Process agent response and handle questions
  const handleAgentResponse = () => {
    if (!object) return;

    // If there are no questions, we can proceed to generate layout
    if (!object.questions || object.questions.length === 0) {
      if (object.actionType === "generate") {
        handleGenerateLayout();
      }
    }
    // Otherwise, the questions form will be shown for user to fill
  };

  // 3. Generate layout with answers to questions
  const handleGenerateWithAnswers = () => {
    if (!object || !object.questions || !object.improvedPrompt) {
      return toast.error("No questions or improved prompt available");
    }

    // Check if all questions are answered
    const unanswered = object.questions.some((_, index) => !answers[index]);
    if (unanswered) {
      return toast.error("Please answer all questions");
    }

    // Create improved prompt with answers
    let finalPrompt = object.improvedPrompt;
    object.questions.forEach((q, index) => {
      if (answers[index]) {
        // Replace placeholder in the prompt with the answer
        finalPrompt = q?.replace
          ? finalPrompt.replace(q?.replace, answers[index])
          : finalPrompt;
      }
    });

    // Submit the improved prompt to generate layout
    toast.info("Generating layout with your specifications...");
    handleGenerateLayout(finalPrompt);
  };

  // 4. Generate the layout using the final prompt
  const handleGenerateLayout = (customPrompt?: string) => {
    const promptToUse = customPrompt || object?.improvedPrompt;

    if (!promptToUse) {
      return toast.error("No prompt available for layout generation");
    }

    // Use the prompt to generate layout
    toast.info("Generating layout...");

    // Call the generate API with the prompt
    fetch("/api/multi/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: promptToUse }),
    })
      .then((res) => res.json())
      .then((data) => {
        // Check if data matches puckSchema
        const result = puckSchema.safeParse(data);
        if (result.success) {
          applyJsonToPuck(data, "Layout generated and applied!");
        } else {
          toast.error("Generated layout has invalid format");
          console.error("Schema validation error:", result.error);
        }
      })
      .catch((error) => {
        toast.error("Error generating layout");
        console.error("Layout generation error:", error);
      });
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

  // Effect to automatically process agent response when it's received
  useEffect(() => {
    if (object && !isLoading) {
      handleAgentResponse();
    }
  }, [object, isLoading]);

  return (
    <div className="flex flex-col space-y-4 h-full">
      <div className="flex items-center gap-2 mb-2">
        <Badge variant="outline" className="bg-blue-50 text-blue-600">
          AI Layout Generator
        </Badge>
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
              handleAgent();
            }
          }}
        />
        <div className="flex justify-between mt-2">
          <div className="flex space-x-2">
            <Button
              onClick={handleAgent}
              disabled={isLoading || !inputValue.trim()}
              size="sm"
            >
              Generate Layout
            </Button>
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

      {/* Error display */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-700 mb-4">
          <p className="font-medium">Error occurred</p>
          <p className="text-sm">{error.message}</p>
        </div>
      )}

      {/* Results area */}
      {object && (
        <div className="space-y-8">
          <div className="bg-green-50 border border-green-200 rounded-md p-2">
            {object.response && (
              <div className="mb-6 text-sm rounded">
                <p className="font-medium mb-1">Next Steps:</p>
                <p>{object.response}</p>
              </div>
            )}

            <Separator />

            {/* Questions section - Only shown if questions exist */}
            {object.questions && object.questions.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <p className="font-medium text-sm mb-3">
                  Please answer these questions to customize your layout:
                </p>
                <div className="space-y-4">
                  {object.questions.map((q, idx) => (
                    <div key={idx} className="space-y-1">
                      <Label
                        className="p-1 text-neutral-700"
                        htmlFor={`question-${idx}`}
                      >
                        {q?.question}
                      </Label>
                      <Input
                        id={`question-${idx}`}
                        value={answers[idx] || ""}
                        onChange={(e) =>
                          handleAnswerChange(idx, e.target.value)
                        }
                        placeholder="Your answer"
                        className="bg-white"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleGenerateWithAnswers}
                  className="w-full"
                  disabled={
                    Object.keys(answers).length <
                    (object.questions?.length || 0)
                  }
                >
                  Apply
                </Button>
              </div>
            )}

            {/* Generate layout button - Only shown if no questions or when in actionType=generate */}
            {(!object.questions || object.questions.length === 0) &&
              object.actionType === "generate" && (
                <Button
                  onClick={() => handleGenerateLayout()}
                  className="w-full"
                >
                  Generate Layout
                </Button>
              )}

            {object.pages && object.pages.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <p className="font-medium text-sm mb-3">Pages to be created:</p>
                <div className="space-y-2">
                  {(object.pages || []).map((page, idx) => (
                    <Alert
                      key={page?.slug}
                      className="flex justify-between items-center"
                    >
                      <div className="flex-col gap-1">
                        <AlertTitle>{page?.title}</AlertTitle>
                        <AlertDescription>{page?.slug}</AlertDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="create page"
                        onClick={() => {
                          const url = `/editor/${page?.slug}/edit?prompt=${encodeURIComponent(
                            page?.prompt!
                          )}`;
                          window.open(url, "_blank");
                        }}
                      >
                        <SendHorizonal size="16" />
                      </Button>
                    </Alert>
                  ))}
                </div>
                <Button
                  onClick={() => {
                    // open all pages with /slug/edit?prompt=... in new tabs using js

                    object.pages?.forEach((page) => {
                      const url = `/editor/${page?.slug}/edit?prompt=${encodeURIComponent(
                        page?.prompt!
                      )}`;
                      window.open(url, "_blank");
                    });
                  }}
                >
                  Create All
                </Button>
              </div>
            )}

            {isLoading ? (
              <div className="flex w-full justify-center items-center py-2 gap-2">
                Generating
                <Loader2 className="animate-spin size-4" />
              </div>
            ) : null}
          </div>
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
              <Loader2 className="animate-spin" />
            </div>
            <p className="text-muted-foreground">Processing your input</p>
          </div>
        </div>
      )}
    </div>
  );
}
