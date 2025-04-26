"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { usePuck, type Data } from "@measured/puck";
import { toast } from "sonner";
import { CircleStop, Loader2, SendHorizonal } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@workspace/ui/components/button";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import { agentSchema } from "@/schema/agent";
import { UnsplashImage } from "@/lib/snippets/unsplash";

import { id } from "@/lib/snippets/id";
import { zones } from "@/lib/snippets/zones";
import { transformers } from "@/lib/snippets/transformers";
import { processUnsplashImages } from "@/lib/snippets/unsplash";

import { useLayoutGenerator } from "@/hooks/use-layout-generator";
import { QuestionForm } from "./chat-agent/question-form";
import { UnsplashGallery } from "./chat-agent/unsplash-gallery";
import { LoadingState } from "./chat-agent/loading-state";
import { EmptyState } from "./chat-agent/empty-state";
import TestApplyToJson from "./test";
import { puckSchema } from "@/app/(dashboard)/dashboard/puck/schema";

export default function ChatComponent({
  path,
  prompt,
}: {
  path?: string;
  prompt?: string;
}) {
  const [inputValue, setInputValue] = useState(prompt);
  const [isProcessingUnsplash, setIsProcessingUnsplash] = useState(false);
  const [unsplashImages, setUnsplashImages] = useState<UnsplashImage[]>([]);
  const router = useRouter();
  const [justApplied, setJustApplied] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [initialLoading, setInitialLoading] = useState(!!prompt);
  const {
    dispatch,
    appState: { data: currentData },
  } = usePuck();
  const [initial, setInitialApplied] = useState(prompt ? false : true);
  const pathname = usePathname();

  // Normalize path function (treat /home as /)
  const normalizePath = (path: string) => {
    path.startsWith("/") ? path : `/${path}`;
    return path === "/home" ? "/" : path;
  };

  // Get current normalized path
  const currentPath = normalizePath(pathname.replace("/edit", ""));

  // Process the generated JSON through all converters - moved from use-agent-actions
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

  // Common function to apply JSON data to Puck - moved from use-agent-actions
  const applyJsonToPuck = (
    jsonData: any,
    successMessage: string = "Layout applied to editor!"
  ) => {
    try {
      // Process JSON through converters
      const processedData = processGeneratedJson(jsonData);

      setIsProcessingUnsplash(true);
      processUnsplashImages(processedData)
        .then(({ data: processedData, images }) => {
          // Store the unsplash images in state
          setUnsplashImages(images);

          // Apply to Puck
          setTimeout(() => {
            dispatch({
              type: "setData",
              data: {
                ...processedData,
                root: processedData.root
                  ? {
                      props: processedData.root,
                    }
                  : currentData.root,
              } as Data,
            });
          }, 300);
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

  const { generateLayout } = useLayoutGenerator({
    applyJsonToPuck,
    setInitialLoading,
  });

  // Use the useObject hook for agent response
  const { object, submit, isLoading, stop, error } = useObject({
    api: path || "/api/agent/google",
    schema: agentSchema,
    onFinish({ object, error }) {
      if (object) {
        toast.success("Generated response successfully!");
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

  useEffect(() => {
    if (justApplied) {
      setJustApplied(false);
    }
  }, [justApplied]);

  // Handle initial prompt
  useEffect(() => {
    // Track whether request has been sent to avoid multiple generations
    let requestSent = false;

    if (prompt && !initial && !requestSent) {
      console.log("Processing initial prompt:", prompt);
      setInitialLoading(true);
      const urlDecoded = decodeURIComponent(prompt);
      setInputValue(urlDecoded);
      requestSent = true;

      // Use one-time timeout to handle the request
      const timer = setTimeout(async () => {
        await generateLayout(urlDecoded);
        setInitialLoading(false);
        setInitialApplied(true);
        // Remove prompt from url params
        router.push(pathname);
      }, 100);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [prompt, initial, pathname, router]);

  // Handle agent form submission
  const handleAgent = () => {
    if (!inputValue?.trim()) {
      return toast.info("Please enter a description to generate a layout.");
    }

    setAnswers({});
    submit({ prompt: inputValue });
  };

  // Process agent response
  const handleAgentResponse = () => {
    if (!object) return;

    if (!object.questions || object.questions.length === 0) {
      if (object.actionType === "reprompt") {
        generateLayout(object.improvedPrompt);
      }
    }
  };

  // Handle answer changes for questions
  const handleAnswerChange = (index: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [index]: value,
    }));
  };

  // Generate layout with answers
  const handleGenerateWithAnswers = () => {
    if (!object || !object.questions || !object.improvedPrompt) {
      return toast.error("No questions or improved prompt available");
    }

    const unanswered = object.questions.some((_, index) => !answers[index]);
    if (unanswered) {
      return toast.error("Please answer all questions");
    }

    let finalPrompt = object.improvedPrompt;
    object.questions.forEach((q, index) => {
      if (answers[index]) {
        finalPrompt = q?.replace
          ? finalPrompt.replace(q?.replace, answers[index])
          : finalPrompt;
      }
    });

    toast.info("Generating layout with your specifications...");
    generateLayout(finalPrompt);
  };

  // Auto-process agent response
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
              disabled={isLoading || !inputValue?.trim() || initialLoading}
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

            {/* Questions section - Using extracted component */}
            {object.questions && object.questions.length > 0 && (
              <QuestionForm
                questions={object.questions as any}
                answers={answers}
                onAnswerChange={handleAnswerChange}
                onSubmit={handleGenerateWithAnswers}
              />
            )}

            {/* Generate layout button */}
            {(!object.questions || object.questions.length === 0) &&
              object.actionType === "reprompt" && (
                <Button
                  onClick={() => generateLayout(object.improvedPrompt)}
                  className="w-full"
                >
                  Generate Layout
                </Button>
              )}

            {object.pages && object.pages.length > 0 && (
              <div className="mt-4 flex flex-col gap-4">
                <p className="font-medium text-sm mb-3">Pages to be created:</p>
                <div className="space-y-2">
                  {(object.pages || []).map((page, idx) => {
                    const pagePath = `/${
                      page?.slug?.startsWith("/")
                        ? page?.slug
                        : `/${page?.slug}`
                    }`;
                    const isCurrentPage =
                      normalizePath(pagePath) === currentPath;

                    return (
                      <Alert
                        key={page?.slug}
                        className={`flex justify-between items-center ${isCurrentPage ? "border-blue-500 bg-blue-50" : ""}`}
                      >
                        <div className="flex-col gap-1">
                          <AlertTitle>
                            {page?.title} {isCurrentPage && "(Current Page)"}
                          </AlertTitle>
                          <AlertDescription>{page?.slug}</AlertDescription>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={
                            isCurrentPage
                              ? "update current page"
                              : "create page"
                          }
                          onClick={() => {
                            const uri = isCurrentPage
                              ? `?prompt=${encodeURIComponent(page?.prompt!)}`
                              : `/${
                                  page?.slug?.startsWith("/")
                                    ? page?.slug?.slice(1)
                                    : page?.slug
                                }/edit?prompt=${encodeURIComponent(page?.prompt!)}`;

                            const siteUrl = window.location.origin;
                            const fullUrl = `${siteUrl}/${uri}`;

                            const anchor = document.createElement("a");
                            anchor.href = fullUrl;
                            anchor.target = "_blank";
                            anchor.click();
                            anchor.remove();
                          }}
                        >
                          <SendHorizonal size="16" />
                        </Button>
                      </Alert>
                    );
                  })}
                </div>
                <Button
                  onClick={() => {
                    // Filter out current page and open only other pages
                    object.pages
                      ?.filter(
                        (page) =>
                          normalizePath(`/${page?.slug}`) !== currentPath
                      )
                      ?.forEach((page) => {
                        const pagePath = `/${page?.slug}`;
                        const isCurrentPage =
                          normalizePath(pagePath) === currentPath;

                        if (!isCurrentPage) {
                          const uri = `/${page?.slug}/edit?prompt=${encodeURIComponent(
                            page?.prompt!
                          )}`;
                          const siteUrl = window.location.origin;
                          const fullUrl = `${siteUrl}/${uri}`;
                          // Use anchor tag to open in new tab

                          const anchor = document.createElement("a");
                          anchor.href = fullUrl;
                          anchor.target = "_blank";
                          anchor.click();
                          anchor.remove();
                        }
                      });
                  }}
                >
                  Create All Others
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

      {/* Empty state - Using extracted component */}
      {!object && !isLoading && !initialLoading && !error && <EmptyState />}

      {/* Loading state - Using extracted component */}
      {(isLoading || initialLoading) && !object && (
        <LoadingState isInitialLoading={initialLoading} />
      )}

      {/* Unsplash gallery - Using extracted component */}
      {(isProcessingUnsplash || unsplashImages.length > 0) && (
        <UnsplashGallery images={unsplashImages} />
      )}
    </div>
  );
}
