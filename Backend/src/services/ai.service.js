import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "langchain";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});


const generateResponse = async(message) => {
  const response = await model.invoke([
    new HumanMessage(message)
    ]);
    
  return response.text;
};


export default generateResponse;