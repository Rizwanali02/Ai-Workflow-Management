require("dotenv").config({ path: ".env" });
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function run() {
  const key = process.env.GOOGLE_GEMINI_API_KEY.replace(/['"]/g, '');
  console.log("Using key:", key.substring(0, 5) + "...");
  const genAI = new GoogleGenerativeAI(key);

  try {
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models?key=" + key);
    const data = await response.json();
    const models = data.models.map(m => m.name);
    console.log("Available models:", models.filter(m => m.includes("gemini")));
  } catch (e) {
    console.error("Fetch error", e);
  }
}
run();
