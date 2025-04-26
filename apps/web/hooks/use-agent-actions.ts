import { toast } from "sonner";
import { usePuck, type Data } from "@measured/puck";
import { Dispatch, SetStateAction } from "react";

import { id } from "@/lib/snippets/id";
import { zones } from "@/lib/snippets/zones";
import { transformers } from "@/lib/snippets/transformers";
import {
  processUnsplashImages,
  type UnsplashImage,
} from "@/lib/snippets/unsplash";

interface UseAgentActionsProps {
  setIsProcessingUnsplash: Dispatch<SetStateAction<boolean>>;
  setUnsplashImages: Dispatch<SetStateAction<UnsplashImage[]>>;
  setJustApplied: Dispatch<SetStateAction<boolean>>;
}

export const useAgentActions = ({
  setIsProcessingUnsplash,
  setUnsplashImages,
  setJustApplied,
}: UseAgentActionsProps) => {
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
      const {
        dispatch,
        appState: { data: currentData },
      } = usePuck();

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

  return {
    processGeneratedJson,
    applyJsonToPuck,
  };
};
