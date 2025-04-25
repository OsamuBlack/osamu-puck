import { streamObject, streamText } from "ai";

import { google } from "@ai-sdk/google";
import promptMulti from "@/lib/prompts/promptMultiComponents.md";
import { z } from "zod";
import { agentSchema } from "@/schema/agent";

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
    system: `You are a website design master and know how to setup a website. According to user query you will respond with a response and action type. The action type can be createPages or generate. If the action type is createPages, then return the pages to be created with slug, title and prompt to generate. If the action type is generate, then return the improved prompt. For now only uset 'genearte' for /home keep slug '/'`,
    prompt: prompt,
    schema: agentSchema,
    onFinish({ object }) {
      console.log("Generated Object:", JSON.stringify(object));
    },
    onError(error) {
      console.error("Error:", error);
    },
  });

  return result.toTextStreamResponse();
}
