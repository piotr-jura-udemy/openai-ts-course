import OpenAI from "openai";
import "dotenv/config";

const openai = new OpenAI();

async function main() {
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: "Write a one-sentence bedtime story about a unicorn.",
  });

  console.log(response.output_text);
}

main();
