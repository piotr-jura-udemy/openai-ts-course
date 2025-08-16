import OpenAI from "openai";
import "dotenv/config";
import { createInterface } from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const openai = new OpenAI();
const rl = createInterface({ input, output });

// TODO: Define tools array with function schema
// - Create tools array with get_account_balance function
// - Define parameters: account_type (string) for checking/savings/credit
// - Use strict: true for reliable function calling

// TODO: Create mock financial data
// - Add userFinanceData object with account balances
// - Include checking, savings, and credit card accounts
// - Mock realistic balances and masked account numbers

// TODO: Implement function execution handler
// - Create executeFunction() to process tool calls
// - Handle account lookup and balance formatting
// - Return formatted account information strings

let conversationHistory: any[] = [
  {
    role: "system",
    content:
      "You are a personal finance assistant. Help users understand their finances by providing helpful financial insights.",
  },
];

console.log("🏦 Personal Finance Assistant");
console.log("💡 Ask me anything about finances!");
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

  // Add user message to conversation
  conversationHistory.push({
    role: "user",
    content: userMessage,
  });

  console.log("\n🤖 AI:");

  // Basic chat response (no tools yet)
  const response = await openai.responses.create({
    model: "gpt-4o",
    input: conversationHistory,
    // TODO: Enable function calling by adding tools parameter
    // - Uncomment tools: tools to give AI access to functions
  });

  // Simple response without function calling
  console.log(response.output_text);
  conversationHistory = conversationHistory.concat(response.output);

  // TODO: Add function calling detection and execution
  // - Filter response.output for function_call items
  // - Loop through function calls and execute each one
  // - Add function results back to conversation history
  // - Make second API call to get AI's final response with tool results

  console.log("\n");
}

rl.close();
