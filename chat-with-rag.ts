import OpenAI from "openai";
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { join } from "node:path";
import { readdirSync, readFileSync } from "node:fs";
import { similarity } from "ml-distance";

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

function loadKB(): Omit<DocumentChunk, "embedding">[] {
  const kbDir = join(process.cwd(), "knowledge");
  const files = readdirSync(kbDir).filter((f) => f.endsWith(".md"));

  const docs: Omit<DocumentChunk, "embedding">[] = [];

  for (const file of files) {
    const content = readFileSync(join(kbDir, file), "utf-8");

    const chunkSize = 1000;
    const chunks: string[] = [];

    for (let i = 0; i < content.length; i += chunkSize) {
      const slice = content.slice(i, i + chunkSize).trim();
      if (slice.length > 0) chunks.push(slice);
    }

    if (chunks.length > 1) {
      const last = chunks[chunks.length - 1]!;

      if (last?.length < 200) {
        chunks[chunks.length - 2] = `${chunks[chunks.length - 2]} ${last}`;
        chunks.pop();
      }
    }

    chunks.forEach((chunk) => {
      docs.push({
        content: chunk.trim(),
        metadata: {
          filename: file,
        },
      });
      console.log(`${file} chunk length: ${chunk.length}`);
    });
  }

  return docs;
}

async function createEmbeddings(texts: string[]): Promise<number[][]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: texts,
  });

  return response.data.map((item) => item.embedding);
}

async function initKB(): Promise<void> {
  console.log("🔄 Loading knowledge base...");
  const docs = loadKB();

  const texts = docs.map((doc) => doc.content);
  const embeddings = await createEmbeddings(texts);

  knowledgeBase = docs.map((doc, index) => ({
    ...doc,
    embedding: embeddings[index]!,
  }));

  console.log(
    `✅ Knowledge base ready with ${knowledgeBase.length} documents\n`
  );
}

async function searchKB(
  query: string,
  topK: number = 2
): Promise<Array<DocumentChunk & { similarity: number }>> {
  if (knowledgeBase.length === 0) return [];

  const embeddings = await createEmbeddings([query]);
  const queryEmbedding = embeddings[0]!;

  const results = knowledgeBase
    .map((doc) => ({
      ...doc,
      similarity: similarity.cosine(queryEmbedding, doc.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);

  // 1.0
  // 0.8-0.9 very similar
  // 0.5-0.7 related content
  // >= 0.3 loosly related
  // < 0.3 mostly unrelated
  return results.filter((r) => r.similarity > 0.3);
}

let conversationHistory: { role: string; content: string }[] = [
  {
    role: "system",
    content:
      "You are a helpful AI assistant. Be conversational, friendly, and remember what user tells you throghout our chat.",
  },
];
console.log("🤖 ChatGPT Clone 1.0");
console.log("💡 Type 'exit' or 'quit' to end chat\n");

initKB();

while (true) {
  const userMessage = await rl.question("You: ");

  if (
    userMessage.toLowerCase() === "exit" ||
    userMessage.toLowerCase() === "quit"
  ) {
    console.log("\n🤖 Thanks for chatting! Bye!");
    break;
  }

  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  console.log("\n🤖 AI:");

  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: conversationHistory as any,
    stream: true,
  });

  let aiResponse = "";

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || "";
    process.stdout.write(content);
    aiResponse += content;
  }

  console.log("\n\n");

  conversationHistory.push({
    role: "assistant",
    content: aiResponse,
  });
}

rl.close();
