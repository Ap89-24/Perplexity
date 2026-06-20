import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY
});


const testAi = async() => {
    const response = await model.invoke("What is the capital of india?");
    console.log(response.text);
};


export default testAi;