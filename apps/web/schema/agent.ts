import { z } from "zod";

export const agentSchema = z.object({
  response: z
    .string()
    .describe(
      "Description of the actions the ai model will perform based on prompt."
    ),
  actionType: z.enum(["createPages", "reprompt"]).describe("Type of action to be performed. If the user asks for a few section or a single page go towards reprompt."),
  improvedPrompt: z
    .string()
    .describe(
      "Improved prompt for the reprompt action type. You can add [qna_keyword] but they need to be replacable via the questions."
    )
    .optional(),
  questions: z
    .array(
      z.object({
        question: z
          .string()
          .describe(
            "Question to be answered. Keep questions short, like 3-5 words, and non-technical only for reprompt."
          ),
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
      "Array of pages to be created when action type is createPages. Each page has a slug, title, and prompt to generate. Like for a ecommerce store, generate home page, about, products, and checkout page. Only generate pages if more than one is needed."
    ),
});
