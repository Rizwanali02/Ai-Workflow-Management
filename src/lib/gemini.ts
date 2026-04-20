import { GoogleGenerativeAI } from "@google/generative-ai";
const apiKey = (process.env.GOOGLE_GEMINI_API_KEY || "").replace(/['"]/g, "");
export const genAI = new GoogleGenerativeAI(apiKey);
export const getGeminiModel = () => {
  const modelName = (process.env.GEMINI_MODEL || "gemini-2.5-flash").replace(/['"]/g, "");
  return genAI.getGenerativeModel({
    model: modelName,
  });
};