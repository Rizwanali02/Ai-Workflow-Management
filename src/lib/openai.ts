import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: process.env.API_URL || "https://api.groq.com/openai/v1",
});
export default openai;
