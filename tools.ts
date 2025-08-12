import OpenAI from "openai";
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const openai = new OpenAI();
const rl = createInterface({ input, output });

let conversationHistory =
  "You are a helpful AI assistant. Be conversational, friendly, and remember what user tells you throghout our chat.\n\n";

console.log("🤖 ChatGPT Clone 1.0 with search");
console.log("💡 Type 'exit' or 'quit' to end chat\n");

while (true) {
  const userMessage = await rl.question("You: ");

  if (
    userMessage.toLowerCase() === "exit" ||
    userMessage.toLowerCase() === "quit"
  ) {
    console.log("\n🤖 Thanks for chatting! Bye!");
    break;
  }

  conversationHistory += `User: ${userMessage}\n`;
  const prompt = conversationHistory + "Assistant: ";

  console.log("\n🤖 AI:");

  const stream = await openai.responses.create({
    model: "gpt-4o",
    input: prompt,
    stream: true,
    tools: [{ type: "web_search_preview" }],
  });

  let aiResponse = "";

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      process.stdout.write(event.delta);
      aiResponse += event.delta;
    } else if (event.type === "response.web_search_call.searching") {
      process.stdout.write("🔎 Searching the web...");
    } else if (event.type === "response.web_search_call.completed") {
      process.stdout.write(" Done\n");
    }
  }

  console.log("\n\n");

  conversationHistory += `Assistant: ${aiResponse}\n\n`;
}

rl.close();
