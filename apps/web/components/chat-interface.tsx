"use client";

import * as React from "react";
import { useState, useRef, useEffect } from "react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Badge } from "@workspace/ui/components/badge";
import { Separator } from "@workspace/ui/components/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
} from "@workspace/ui/components/sheet";
import { Slider } from "@workspace/ui/components/slider";
import { config as puckConfig, schema } from "@/puck.config";
import { usePuck, type Data } from "@measured/puck";
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { promptV1 } from "./prompt";
import { processData } from "../lib/processSnippets";
import { Settings, Check, Key, Copy, ClipboardPaste, Clipboard, Code } from "lucide-react";
import { JsonEditor } from "@workspace/ui/components/json-editor";
import { toast } from "sonner";

export function ChatInterface({
  onApplyChanges,
}: {
  onApplyChanges?: (data: Data) => void;
}) {
  const [messages, setMessages] = useState<
    Array<{ 
      text: string; 
      sender: "user" | "ai"; 
      timestamp: Date;
      json?: Data | null;
    }>
  >([]);
  const {
    dispatch,
    appState: { data: currentPuckData },
  } = usePuck();
  const [inputValue, setInputValue] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [savedApiKey, setSavedApiKey] = useState("");
  const [isApiKeySet, setIsApiKeySet] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [puckData, setPuckData] = useState<Data | null>(null);
  const [streamingText, setStreamingText] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [isSettingsSheetOpen, setIsSettingsSheetOpen] = useState(false);
  const [modelSettings, setModelSettings] = useState({
    model: "gemini-2.0-flash",
    temperature: 0.7,
  });
  const [isReviewSheetOpen, setIsReviewSheetOpen] = useState(false);
  const [editedJson, setEditedJson] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const genAIRef = useRef<GoogleGenerativeAI | null>(null);

  // Load API key on mount
  useEffect(() => {
    const storedKey = localStorage.getItem("ai-api-key");
    if (storedKey) {
      setSavedApiKey(storedKey);
      setIsApiKeySet(true);
    }
  }, []);

  // Load messages from localStorage
  useEffect(() => {
    const savedMessages = localStorage.getItem("chat-messages");
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages);
        // Convert string timestamps back to Date objects
        const messagesWithDates = parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }));
        setMessages(messagesWithDates);
      } catch (e) {
        console.error("Failed to parse saved messages:", e);
      }
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("chat-messages", JSON.stringify(messages));
  }, [messages]);

  // Update genAI when API key changes
  useEffect(() => {
    if (isApiKeySet && savedApiKey) {
      genAIRef.current = new GoogleGenerativeAI(savedApiKey);
    }
  }, [isApiKeySet, savedApiKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Copy prompt to clipboard
  const copyPromptToClipboard = () => {
    const currentPrompt = promptV1(schema, currentPuckData);
    navigator.clipboard.writeText(currentPrompt)
      .then(() => {
        toast.success("Prompt copied to clipboard");
      })
      .catch((err) => {
        console.error("Failed to copy prompt:", err);
        toast.error("Failed to copy prompt");
      });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !isApiKeySet || !genAIRef.current) return;

    const userMessage = {
      text: inputValue,
      sender: "user" as const,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsStreaming(true);
    setStreamingText("");

    try {
      const model = genAIRef.current.getGenerativeModel({
        model: modelSettings.model,
        generationConfig: {
          temperature: modelSettings.temperature,
        },
        systemInstruction: promptV1(schema, currentPuckData),
      });

      const chat = model.startChat({
        safetySettings: [
          {
            category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
            threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
          },
        ],
      });

      const prompt = `${inputValue}\n\nPlease return only a valid JSON for the Puck editor structure.`;
      
      // Using streaming response
      const result = await chat.sendMessageStream(prompt);
      
      let fullResponse = "";
      
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullResponse += chunkText;
        setStreamingText(prev => prev + chunkText);
      }
      
      setIsStreaming(false);
      
      // Process the full response after streaming
      let generatedData: Data | null = null;
      let explanationMessage = "";
      
      try {
        const jsonMatch =
          fullResponse.match(/```(?:json)?\s*([\s\S]*?)\s*```/) ||
          fullResponse.match(/(\{[\s\S]*\})/);
          
        if (jsonMatch) {
          const jsonStr = jsonMatch[1];
          // Process the data to replace generate snippet patterns with actual values
          const parsedData = JSON.parse(jsonStr!);
          
          // Process the data with the current data context to handle copy and spread functionality
          generatedData = processData(parsedData, currentPuckData);
          
          // Store the processed data
          setPuckData(generatedData);
          
          // Create an explanation message without the JSON
          explanationMessage = "✅ I've created a layout based on your request. You can review the JSON or apply it directly to the editor.";
          
          // Add the AI explanation message to chat history
          setMessages(prev => [
            ...prev, 
            { 
              text: explanationMessage, 
              sender: "ai", 
              timestamp: new Date(),
              json: generatedData 
            }
          ]);
        } else {
          // No valid JSON found, just use the full response
          setMessages(prev => [
            ...prev, 
            { 
              text: fullResponse, 
              sender: "ai", 
              timestamp: new Date() 
            }
          ]);
        }
      } catch (e) {
        console.error("Failed to parse JSON:", e);
        setMessages(prev => [
          ...prev,
          {
            text: "❌ I generated a response but couldn't parse valid JSON from it. Please try again with a different prompt.",
            sender: "ai",
            timestamp: new Date(),
          },
        ]);
      }

    } catch (error) {
      console.error("Error in chat:", error);
      setMessages(prev => [
        ...prev,
        {
          text: "❌ Error. Please check your API key.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      setIsStreaming(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      
      if (!clipboardText) {
        toast.error("Clipboard is empty");
        return;
      }
      
      // Try to parse as JSON
      let clipboardData;
      try {
        clipboardData = JSON.parse(clipboardText);
      } catch (e) {
        toast.error("Clipboard content is not valid JSON");
        return;
      }
      
      // Validate it has the basic Puck data structure
      if (!clipboardData || typeof clipboardData !== 'object') {
        toast.error("Invalid data format");
        return;
      }
      
      // Process the data in case it contains snippet patterns
      const processedData = processData(clipboardData, currentPuckData);
      
      // Apply to Puck editor
      dispatch({ type: "setData", data: processedData });
      
      // Update messages with confirmation
      setMessages(prev => [
        ...prev,
        {
          text: "🎯 Content pasted from clipboard and applied to editor.",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      
      toast.success("Content pasted from clipboard");
      
    } catch (error) {
      console.error("Failed to paste from clipboard:", error);
      toast.error("Failed to paste from clipboard");
    }
  };

  const openReviewSheet = () => {
    if (!puckData) return;
    
    setEditedJson(JSON.stringify(puckData, null, 2));
    setIsReviewSheetOpen(true);
  };

  const applyEditedJson = () => {
    try {
      const parsedData = JSON.parse(editedJson);
      dispatch({ type: "setData", data: parsedData });
      
      setMessages(prev => [
        ...prev,
        {
          text: "🎯 Applied edited JSON to editor successfully!",
          sender: "ai",
          timestamp: new Date(),
        },
      ]);
      
      setIsReviewSheetOpen(false);
    } catch (error) {
      console.error("Error parsing JSON:", error);
      toast.error("Invalid JSON. Please check your edits.");
    }
  };

  const applyToPuck = () => {
    if (!puckData) return;

    // Apply processed data directly to the editor
    dispatch({ type: "setData", data: puckData });

    setMessages(prev => [
      ...prev,
      {
        text: "🎯 Applied to editor successfully!",
        sender: "ai",
        timestamp: new Date(),
      },
    ]);
  };

  const saveApiKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("ai-api-key", apiKey);
      setSavedApiKey(apiKey);
      setIsApiKeySet(true);
      setApiKey("");
    }
  };

  const clearApiKey = () => {
    localStorage.removeItem("ai-api-key");
    setSavedApiKey("");
    setIsApiKeySet(false);
    setMessages([]);
    setPuckData(null);
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("chat-messages");
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <>
      <div className="flex flex-col max-w-md mx-auto">
        <div className="space-y-2 py-0">
          <div className="flex items-center gap-2">
            <Badge
              variant={isApiKeySet ? "outline" : "destructive"}
              className={isApiKeySet ? "bg-green-50 text-green-600" : ""}
            >
              {isApiKeySet ? "API Key Set" : "No API Key"}
            </Badge>
            <Badge variant="outline" className="bg-blue-50 text-blue-600">
              {modelSettings.model.includes("flash") ? "Flash" : "Pro"}
            </Badge>
            
            {/* Paste from clipboard button */}
            <Button 
              size="icon" 
              variant="outline" 
              title="Paste JSON from clipboard"
              onClick={handlePasteFromClipboard}
            >
              <ClipboardPaste className="h-4 w-4" />
            </Button>

            {/* Settings button */}
            <Button
              size="icon"
              variant="outline"
              title="AI Settings"
              onClick={() => setIsSettingsSheetOpen(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          <Separator />

          {/* Messages section */}
          <div className="flex-1 overflow-y-auto p-2 space-y-4 pb-48">
            {messages.length === 0 && (
              <div className="text-muted-foreground text-center mt-8">
                {isApiKeySet
                  ? "Start typing your request!"
                  : "Set your API key in settings to begin."}
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col ${
                  msg.sender === "user" ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`max-w-full px-4 py-2 rounded-lg whitespace-pre-wrap text-sm ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground rounded-br-none"
                      : "bg-muted text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  {msg.json && (
                    <div className="mt-2 flex justify-center">
                      <Button
                        onClick={openReviewSheet}
                        variant="outline"
                        size="sm"
                        className="border-blue-500 text-blue-600 hover:bg-blue-50 flex items-center gap-1"
                      >
                        <Code className="h-4 w-4" /> Review JSON
                      </Button>
                      <Button
                        onClick={applyToPuck}
                        variant="outline"
                        size="sm"
                        className="border-green-500 text-green-600 hover:bg-green-50 ml-2"
                      >
                        Apply to Editor
                      </Button>
                    </div>
                  )}
                </div>
                <span className="text-xs text-muted-foreground mt-1">
                  {formatTime(msg.timestamp)}
                </span>
              </div>
            ))}

            {isStreaming && (
              <div className="flex items-start">
                <div className="bg-muted text-foreground rounded-lg px-4 py-2 rounded-bl-none">
                  <p className="whitespace-pre-wrap">{streamingText}</p>
                </div>
              </div>
            )}

            {isLoading && !isStreaming && (
              <div className="flex items-start">
                <div className="bg-muted text-foreground rounded-lg px-4 py-2">
                  <div className="flex items-center gap-1">
                    <div
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "0ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "150ms" }}
                    />
                    <div
                      className="h-2 w-2 bg-muted-foreground rounded-full animate-bounce"
                      style={{ animationDelay: "300ms" }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <Separator />

          {/* Input section */}
          <div
            className="fixed bottom-0 left-0 right-0 p-2 bg-background "
            style={{
              width: "var(--puck-side-bar-width)",
              borderRight: "1px solid var(--puck-color-grey-09)",
            }}
          >
            <div className="flex flex-col gap-2 w-full">
              <div className="flex justify-between items-center mb-1">
                <Button
                  onClick={clearChat}
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground"
                >
                  Clear chat history
                </Button>
              </div>
              <Textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !e.shiftKey && handleSendMessage()
                }
                placeholder={
                  isApiKeySet
                    ? "Describe your layout..."
                    : "Set API key in settings first"
                }
                disabled={!isApiKeySet || isLoading}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!isApiKeySet || !inputValue.trim() || isLoading}
              >
                {isLoading ? "..." : "Generate"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Sheet (replaced Dialog) */}
      <Sheet open={isSettingsSheetOpen} onOpenChange={setIsSettingsSheetOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto p-4">
          <SheetHeader>
            <SheetTitle>AI Settings</SheetTitle>
          </SheetHeader>

          <div className="space-y-4 py-4">
            <h4 className="font-medium">API Configuration</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-1">
                <Key className="h-3 w-3" />
                Google AI API Key
              </label>
              {!isApiKeySet ? (
                <div className="flex gap-2">
                  <Input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Enter API Key"
                    className="flex-1"
                  />
                  <Button onClick={saveApiKey} size="sm">
                    Save
                  </Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm bg-muted px-3 py-1.5 rounded flex-1">
                    API: ••••••{savedApiKey.slice(-4)}
                  </div>
                  <Button
                    onClick={clearApiKey}
                    variant="ghost"
                    size="sm"
                    className="text-destructive ml-2"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            <h4 className="font-medium">Model Configuration</h4>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model</label>
              <div className="flex flex-col space-y-1.5">
                <Button
                  variant={
                    modelSettings.model === "gemini-2.0-flash"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="justify-between"
                  onClick={() =>
                    setModelSettings((prev) => ({
                      ...prev,
                      model: "gemini-2.0-flash",
                    }))
                  }
                >
                  Gemini 2.0 Flash
                  {modelSettings.model === "gemini-2.0-flash" && (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  variant={
                    modelSettings.model === "gemini-2.0-pro"
                      ? "default"
                      : "outline"
                  }
                  size="sm"
                  className="justify-between"
                  onClick={() =>
                    setModelSettings((prev) => ({
                      ...prev,
                      model: "gemini-2.0-pro",
                    }))
                  }
                >
                  Gemini 2.0 Pro
                  {modelSettings.model === "gemini-2.0-pro" && (
                    <Check className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium">
                  Temperature: {modelSettings.temperature}
                </label>
              </div>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[modelSettings.temperature]}
                onValueChange={(values) =>
                  setModelSettings((prev) => ({
                    ...prev,
                    temperature: values[0]!,
                  }))
                }
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Precise (0)</span>
                <span>Creative (1)</span>
              </div>
            </div>

            <Separator />

            <h4 className="font-medium">Prompt Template</h4>
            <div className="space-y-2">
              <Button
                onClick={copyPromptToClipboard}
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-2"
              >
                <Copy className="h-3 w-3" />
                Copy Current Prompt
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                View and customize the prompt being sent to the AI.
              </p>
            </div>
          </div>

          <SheetFooter className="pt-4">
            <Button
              onClick={() => setIsSettingsSheetOpen(false)}
              className="w-full"
            >
              Close
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* JSON Review Sheet (replaced Dialog) */}
      <Sheet open={isReviewSheetOpen} onOpenChange={setIsReviewSheetOpen}>
        <SheetContent className="p-4 h-screen overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Review and Edit JSON</SheetTitle>
          </SheetHeader>

          <div className="">
            <JsonEditor
              value={editedJson}
              onChange={setEditedJson}
              placeholder="JSON data"
            />
          </div>

          <SheetFooter className="gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsReviewSheetOpen(false)}
            >
              Cancel
            </Button>
            <Button onClick={applyEditedJson}>Apply Changes</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
