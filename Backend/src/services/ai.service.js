import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { AIMessage, HumanMessage, SystemMessage, tool, createAgent } from "langchain";
import { internetSearch } from "./internet.service.js";
import * as z from "zod";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});


const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY
})


const searchInternetTool = tool(
  internetSearch,
  {
    name: "searchInternet",
    description: `Search the internet for current information.

Use this tool whenever the question contains:

      - latest
      - today
      - yesterday
      - current
      - news
      - this week
      - recent
      - live
      - update
      - price
      - election
      - sports
      - weather

Always use this tool before answering those questions.`,
    schema: z.object({
      query: z.string().describe("The search query to look up on the internet.")
    })
  }
);

const agent = createAgent({
  model: mistralModel,
  tools: [searchInternetTool]
});


export const generateResponse = async (messages) => {
  const formattedMessages = messages
    .map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      }

      else if (msg.role === "AI" || msg.role === "assistant") {
        return new AIMessage(msg.content);
      }

      return null;
    })

  const response = await agent.invoke({
    messages: [
      new SystemMessage(`
      You are a helpful and precise assistant.
      If you don't know the answer, say you don't know.
      If the question requires up-to-date information,
      use the "searchInternet" tool.
    `),
      ...formattedMessages,
    ],
  });

  console.dir(response, { depth: null });
  return response.messages[response.messages.length - 1].text;
};



export const generateTitle = async (message) => {
  const response = await mistralModel.invoke([
    new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
    new HumanMessage(`Generate a title for a chat conversation based on the following first message: ${message}`
    )
  ]);

  return response.text;
};


