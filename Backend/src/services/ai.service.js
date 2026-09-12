import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatMistralAI } from "@langchain/mistralai";
import { ChatGroq } from "@langchain/groq";
import { AIMessage, HumanMessage, SystemMessage, tool, createAgent } from "langchain";
import { internetSearch } from "./internet.service.js";
import { getHybridContext } from "./rag.service.js";
import * as z from "zod";

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
});

const mistralModel = new ChatMistralAI({
  model: "mistral-small-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

const groqModel = new ChatGroq({
  model: "openai/gpt-oss-120b",
  apiKey: process.env.GROQ_API_KEY,
});

const searchInternetTool = tool(internetSearch, {
  name: "searchInternet",
  description: `Search the internet for current information.
Use this tool whenever up-to-date information is needed.`,
  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

const agent = createAgent({
  model: groqModel,
  tools: [searchInternetTool],
});

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const generateResponse = async (messages, onChunk, options = {}) => {
  const { userId, searchMode = "hybrid", selectedDocIds = [], onSources } = options;

  // Retrieve last user message for Hybrid RAG context retrieval
  const lastUserMsgObj = [...messages].reverse().find((m) => m.role === "user");
  const lastUserQuery = lastUserMsgObj ? lastUserMsgObj.content : "";

  let contextText = "";
  let sources = [];

  if (lastUserQuery) {
    try {
      const ragResult = await getHybridContext(lastUserQuery, userId, searchMode, selectedDocIds);
      contextText = ragResult.contextText;
      sources = ragResult.sources;

      if (typeof onSources === "function" && sources.length > 0) {
        await onSources(sources);
      }
    } catch (ragErr) {
      console.error("Error retrieving Hybrid RAG context:", ragErr);
    }
  }

  const formattedMessages = messages
    .map((msg) => {
      if (msg.role === "user") {
        return new HumanMessage(msg.content);
      } else if (msg.role === "AI" || msg.role === "assistant") {
        return new AIMessage(msg.content);
      }
      return null;
    })
    .filter(Boolean);

  let systemPromptText = `
You are a helpful, engaging, and precise Nexora AI assistant.
Use relevant emojis in your responses to make them friendly, visually appealing, and engaging (e.g. 🏆, 🏏, 🚀, ✨, 💡, 📚).
Use clean Markdown formatting (bold text, bullet points, headers) where appropriate.

GROUNDING & CITATION RULES:
1. Always base your response strictly on the provided Context Sources when relevant.
2. For every piece of information taken from a source, add inline citation tags using bracket numbers matching the source id, like [1], [2], or [1][3].
3. Make sure citations appear naturally at the end of relevant sentences or facts.
4. If you don't know the answer or the context doesn't contain it, state what you know clearly.
`;

  if (contextText) {
    systemPromptText += `\n\n=== RETRIEVED CONTEXT SOURCES (WEB & DOCUMENTS) ===\n${contextText}\n=================================================`;
  } else if (searchMode === "document" || (selectedDocIds && selectedDocIds.length > 0)) {
    systemPromptText += `\n\n=== RETRIEVED CONTEXT SOURCES ===\n[NO MATCHING DOCUMENT CONTEXT FOUND IN VECTOR SEARCH FOR THIS USER/DOCUMENT]. If the user asks about a document, politely inform them that no text content was found in their uploaded/selected documents, and ask them to verify that their file contains readable text and is indexed.\n=================================`;
  }

  const inputMessages = [
    new SystemMessage(systemPromptText),
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
                await onChunk(text);
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

  return {
    text: fullResponseText,
    sources,
  };
};

export const generateTitle = async (message) => {
  const response = await groqModel.invoke([
    new SystemMessage(`
You are a helpful assistant that generates concise and descriptive titles for chat conversations.
User will provide you with the first message of a chat conversation, and you will generate a title that captures the essence of the conversation in 2-4 words. Clear, relevant, and engaging.
    `),
    new HumanMessage(`Generate a title for a chat conversation based on the following first message: ${message}`),
  ]);

  return response.text;
};
