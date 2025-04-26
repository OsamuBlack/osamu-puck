import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  isInitialLoading: boolean;
}

export function LoadingState({ isInitialLoading }: LoadingStateProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <Loader2 className="animate-spin" />
        </div>
        <p className="text-muted-foreground">
          {isInitialLoading
            ? "Generating layout from prompt..."
            : "Processing your input"}
        </p>
      </div>
    </div>
  );
}
