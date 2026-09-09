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
  model: geminiModel,
  tools: [searchInternetTool]
});


const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateResponse = async (messages, onChunk) => {
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
    .filter(Boolean);

  const inputMessages = [
    new SystemMessage(`
      You are a helpful, engaging, and precise assistant.
      Use relevant emojis in your responses to make them friendly, visually appealing, and engaging (e.g. 🏆, 🏏, 🚀, ✨, 💡).
      Use clean Markdown formatting (bold text, lists, headers) where appropriate.
      If you don't know the answer, say you don't know.
      If the question requires up-to-date information, use the "searchInternet" tool.
    `),
    ...formattedMessages,
  ];

  let fullResponseText = "";

  if (typeof onChunk === "function") {
    try {
      const eventStream = await agent.streamEvents(
        { messages: inputMessages },
        { version: "v2" }
      );

      for await (const event of eventStream) {
        if (event.event === "on_chat_model_stream") {
          const chunk = event.data?.chunk;
          if (chunk) {
            // Ignore tool call chunks
            if (!chunk.tool_call_chunks || chunk.tool_call_chunks.length === 0) {
              let text = "";
              if (typeof chunk.text === "string" && chunk.text) {
                text = chunk.text;
              } else if (typeof chunk.content === "string" && chunk.content) {
                text = chunk.content;
              } else if (Array.isArray(chunk.content)) {
                text = chunk.content
                  .filter((part) => part.type === "text" && part.text)
                  .map((part) => part.text)
                  .join("");
              }

              if (text) {
                fullResponseText += text;
                if (text.length > 3) {
                  for (const char of text) {
                    await onChunk(char);
                    await delay(15);
                  }
                } else {
                  await onChunk(text);
                  await delay(25);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in LangChain streaming:", error);
    }

    if (!fullResponseText) {
      const response = await agent.invoke({ messages: inputMessages });
      const lastMsg = response.messages[response.messages.length - 1];
      fullResponseText = typeof lastMsg.text === "string" ? lastMsg.text : (lastMsg.content || "");
      if (fullResponseText) {
        onChunk(fullResponseText);
      }
    }
  } else {
    const response = await agent.invoke({ messages: inputMessages });
    const lastMsg = response.messages[response.messages.length - 1];
    fullResponseText = typeof lastMsg.text === "string" ? lastMsg.text : (lastMsg.content || "");
  }

  return fullResponseText;
};



export const generateTitle = async (message) => {
  const response = await geminiModel.invoke([
    new SystemMessage(`
            You are a helpful assistant that generates concise and descriptive titles for chat conversations.
            
            User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. The title should be clear, relevant, and engaging, giving users a quick understanding of the chat's topic.    
        `),
    new HumanMessage(`Generate a title for a chat conversation based on the following first message: ${message}`
    )
  ]);

  return response.text;
};


