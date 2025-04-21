"use client";

import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Button } from "@workspace/ui/components/button";

interface JsonEditorProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export const JsonEditor = React.memo(function JsonEditorComponent({
  value: initialValue = "{}",
  onChange,
  label,
  placeholder = "Enter JSON...",
  className = "",
}: JsonEditorProps) {
  const [text, setText] = useState(initialValue);
  const [isValid, setIsValid] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [highlighted, setHighlighted] = useState<string>("");
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const prevValueRef = useRef(initialValue);

  // Memoize the highlighting function to prevent recreating it on each render
  const applyHighlighting = useMemo(() => {
    return (code: string) => {
      let result = code
        // Highlight keys (in quotes followed by colon)
        .replace(/"([^"]+)":/g, '<span className="text-blue-600">"$1"</span>:')
        // Highlight string values (in quotes)
        .replace(
          /: *"([^"]+)"/g,
          ': <span className="text-green-600">"$1"</span>'
        )
        // Highlight numbers
        .replace(/: *([0-9]+)/g, ': <span className="text-rose-600">$1</span>')
        // Highlight booleans
        .replace(
          /: *(true|false)/g,
          ': <span className="text-yellow-600">$1</span>'
        )
        // Highlight null
        .replace(/: *null/g, ': <span className="text-gray-500">null</span>');

      return result;
    };
  }, []);

  // Update highlighting when text changes
  useEffect(() => {
    // Create highlighted version for display
    setHighlighted(applyHighlighting(text));

    // Validate JSON
    try {
      if (text.trim()) {
        JSON.parse(text);
        setIsValid(true);
        setErrorMessage(null);
      } else {
        setIsValid(true);
        setErrorMessage(null);
      }
    } catch (error) {
      setIsValid(false);
      setErrorMessage((error as Error).message);
    }
  }, [text, applyHighlighting]);

  // Only update text state if initialValue has changed
  useEffect(() => {
    if (initialValue !== prevValueRef.current) {
      setText(initialValue || "{}");
      prevValueRef.current = initialValue;
    }
  }, [initialValue]);

  // Memoize the change handler to maintain referential stability
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
    },
    []
  );

  // Memoize the apply handler to maintain referential stability
  const handleApply = useCallback(() => {
    try {
      if (text.trim()) {
        // Try to parse the JSON to validate
        JSON.parse(text);
        // If successful, update the parent component
        onChange(text);
      }
    } catch (error) {
      // Do nothing if JSON is invalid
    }
  }, [text, onChange]);

  // Memoize the format handler to maintain referential stability
  const handleFormat = useCallback(() => {
    try {
      if (text.trim()) {
        const parsed = JSON.parse(text);
        const formatted = JSON.stringify(parsed, null, 2);
        setText(formatted);
      }
    } catch (error) {
      // Do nothing if JSON is invalid
    }
  }, [text]);

  // Memoize the rendering of the buttons to prevent unnecessary re-renders
  const actionButtons = useMemo(
    () => (
      <div className="flex justify-end gap-2 mt-3">
        <Button
          size="sm"
          type="button"
          variant={"ghost"}
          onClick={handleFormat}
        >
          Format
        </Button>
        <Button
          size="sm"
          type="button"
          onClick={handleApply}
          disabled={!isValid}
        >
          Apply
        </Button>
      </div>
    ),
    [handleFormat, handleApply, isValid]
  );

  return (
    <div className={`w-full font-mono ${className}`}>
      {label && (
        <label className="block text-sm font-medium mb-1">{label}</label>
      )}
      <div className="p-4 border rounded-[4px] border-[var(--puck-color-grey-09)] bg-white">
        <div className="relative">
          {/* Main textarea (invisible, for editing) */}
          <textarea
            ref={editorRef}
            className={`overflow-hidden w-full rounded-[4px] font-mono text-sm resize-y focus:outline-none absolute inset-0 bg-transparent z-10 text-transparent caret-foreground  whitespace-break-spaces ${
              isValid
                ? "border-[var(--puck-color-grey-09)] focus:border-[var(--puck-color-azure-06)]"
                : "border-[var(--puck-color-red-04)] bg-[var(--puck-color-red-10)]"
            }`}
            value={text}
            onChange={handleChange}
            placeholder={placeholder}
            rows={10}
            spellCheck={false}
          />

          {/* Highlighted display (read-only, behind textarea) */}
          <div
            className={`w-full rounded-[4px] font-mono text-sm whitespace-pre-wrap break-words font-medium overflow-hidden min-h-[120px] ${
              isValid ? "bg-white" : "bg-[var(--puck-color-red-10)]"
            }`}
            dangerouslySetInnerHTML={{ __html: highlighted || placeholder }}
          />
        </div>

        {!isValid && errorMessage && (
          <div className="text-xs text-[var(--puck-color-red-04)] mt-1 px-2">
            {errorMessage}
          </div>
        )}
      </div>

      {actionButtons}
    </div>
  );
});

// Export with proper display name for React DevTools
JsonEditor.displayName = "JsonEditor";
