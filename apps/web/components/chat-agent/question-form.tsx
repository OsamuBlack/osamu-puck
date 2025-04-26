import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";

interface Question {
  question: string;
  replace?: string;
}

interface QuestionFormProps {
  questions: Question[];
  answers: Record<number, string>;
  onAnswerChange: (index: number, value: string) => void;
  onSubmit: () => void;
}

export function QuestionForm({
  questions,
  answers,
  onAnswerChange,
  onSubmit,
}: QuestionFormProps) {
  return (
    <div className="mt-4 flex flex-col gap-4">
      <p className="font-medium text-sm mb-3">
        Please answer these questions to customize your layout:
      </p>
      <div className="space-y-4">
        {questions.map((q, idx) => (
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
              onChange={(e) => onAnswerChange(idx, e.target.value)}
              placeholder="Your answer"
              className="bg-white"
            />
          </div>
        ))}
      </div>
      <Button
        onClick={onSubmit}
        className="w-full"
        disabled={Object.keys(answers).length < questions.length}
      >
        Apply
      </Button>
    </div>
  );
}
