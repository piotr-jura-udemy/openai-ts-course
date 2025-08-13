import OpenAI from "openai";
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";
import { readdirSync, readFileSync } from "node:fs";

const openai = new OpenAI();
const rl = createInterface({ input, output });

interface DocumentChunk {
  content: string;
  metadata: {
    filename: string;
  };
  embedding: number[];
}

let knowledgeBase: DocumentChunk[] = [];

function loadKB(): Omit<DocumentChunk, "embedding"> {
  const kbDir = join(process.cwd(), "knowledge");
  const files = readdirSync(kbDir).filter((f) => f.endsWith(".md"));

  const docs: Omit<DocumentChunk, "embedding"> = [];

  for (const file of files) {
    const content = readFileSync(join(kbDir, file), "utf-8");
  }
}

let conversationHistory =
  "You are a helpful AI assistant. Be conversational, friendly, and remember what user tells you throghout our chat.\n\n";

console.log("🤖 ChatGPT Clone 1.0");
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
  });

  let aiResponse = "";

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      process.stdout.write(event.delta);
      aiResponse += event.delta;
    }
  }

  console.log("\n\n");

  conversationHistory += `Assistant: ${aiResponse}\n\n`;
}

rl.close();
