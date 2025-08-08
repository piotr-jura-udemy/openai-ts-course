import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI();

async function main() {
  const stream = await openai.responses.create({
    model: "gpt-4o",
    input: "Write a one-sentence bedtime story about a unicorn.",
    stream: true,
  });

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      process.stdout.write(event.delta);
    }
  }

  console.log();
}

main();
