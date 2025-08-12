import OpenAI from "openai";
import "dotenv/config";
import { z } from "zod";
import { zodTextFormat } from "openai/helpers/zod";

const openai = new OpenAI();

const CustomerFeedbackSchema = z.object({
  sentiment: z.enum(["postive", "neutral", "negative"]),
  summary: z.string(),
  customer_name: z.string(),
});

const customerEmail = `
  From: John Doe <john.doe@example.com>
  Subject: Terrible course!

  It's the worst course I've ever taken on Udemy, give me money back!
`;

const response = await openai.responses.parse({
  model: "gpt-5-nano",
  input: [
    //system
    {
      role: "system",
      content:
        "You are a customer support agent. Extract key information from customer emails and respond in the requested format.",
    },
    //user
    {
      role: "user",
      content: customerEmail,
    },
    //assistant
  ],
  text: {
    format: zodTextFormat(
      CustomerFeedbackSchema,
      "customer_feedback_extraction"
    ),
  },
});

const feedback = response.output_parsed;

console.log("\n Here's the output:");
console.log(JSON.stringify(feedback, null, 2));
