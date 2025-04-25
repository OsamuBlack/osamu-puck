import { z } from "zod";

export const agentSchema = z.object({
  response: z
    .string()
    .describe(
      "Description of the actions the ai model will perform based on prompt."
    ),
  actionType: z.enum(["createPages", "generate"]),
  improvedPrompt: z
    .string()
    .describe(
      "Improved prompt for the generate action type. You can add questions but they need to be replacable via the questions below. Keep the questions simple as the user is not technical. Keep questions short, like 3-5 words."
    )
    .optional(),
  questions: z
    .array(
      z.object({
        question: z.string().describe("Question to be answered."),
        answer: z.string().describe("Answer to the question."),
        replace: z
          .string()
          .describe(
            "Replacement text for the improvedPrompt. Only generate in case of improvedPrompt"
          ),
      })
    )
    .optional(),
  pages: z
    .array(
      z.object({
        slug: z.string().describe("Slug of the page to be created."),
        title: z.string().describe("Title of the page to be created."),
        prompt: z.string().describe("The prompt to generate the page content."),
      })
    )
    .optional()
    .describe(
      "Array of pages to be created when action type is createPages. Each page has a slug, title, and prompt to generate. Like for a ecommerce store, generate home page, about, products, and checkout page."
    ),
});
