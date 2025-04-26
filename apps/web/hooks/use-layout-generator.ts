import { Dispatch, SetStateAction } from "react";
import { toast } from "sonner";
import { puckSchema } from "@/app/(dashboard)/dashboard/puck/schema";

interface UseLayoutGeneratorProps {
  applyJsonToPuck: (jsonData: any, successMessage?: string) => boolean;
  setInitialLoading: Dispatch<SetStateAction<boolean>>;
}

export const useLayoutGenerator = ({
  applyJsonToPuck,
  setInitialLoading,
}: UseLayoutGeneratorProps) => {
  
  // Generate the layout using the final prompt
  const generateLayout = async (customPrompt?: string) => {
    if (!customPrompt) {
      return toast.error("No prompt available for layout generation");
    }

    // Use the prompt to generate layout
    toast.info("Generating layout...");

    try {
      // Call the generate API with the prompt
      const response = await fetch("/api/multi/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: customPrompt }),
      });

      const data = await response.json();

      // Check if data matches puckSchema
      const result = puckSchema.safeParse(data);
      if (result.success) {
        applyJsonToPuck(data, "Layout generated and applied!");
      } else {
        toast.error("Generated layout has invalid format");
        console.error("Schema validation error:", result.error);
      }
    } catch (error) {
      toast.error("Error generating layout");
      console.error("Layout generation error:", error);
      setInitialLoading(false); // Ensure loading is turned off on error
    }
  };

  return {
    generateLayout,
  };
};
