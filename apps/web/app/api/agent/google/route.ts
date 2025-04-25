import { streamObject, streamText } from "ai";

import { google } from "@ai-sdk/google";
import promptMulti from "@/lib/prompts/promptMultiComponents.md";
import { puckSchema } from "@/app/(dashboard)/dashboard/puck/schema";


export const maxDuration = 50; // Allow streaming responses up to 30 seconds

export async function POST(req: Request) {
  const { prompt }: { prompt: string } = await req.json();

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing Google Generative AI API key" }),
      {
        status: 500,
      }
    );
  }

  const system = promptMulti;

  const result = streamObject({
    model: google("gemini-2.0-flash-exp"),
    system,
    prompt: prompt,
    schema: puckSchema,
    onFinish({ object }) {
      console.log("Generated Object:", JSON.stringify(object));
    },
    onError(error) {
      console.error("Error:", error);
    },
  });

  return result.toTextStreamResponse();
}
