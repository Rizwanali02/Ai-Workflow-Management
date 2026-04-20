import { getGeminiModel } from "@/lib/gemini";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { title, description } = await req.json();
    if (!description && !title) {
      return NextResponse.json({ message: "Please provide some text to refine." }, { status: 400 });
    }
    const prompt = `You are an expert product manager and technical writer. 
Please act as a professional project manager. Rewrite and refine the following rough task notes into a professional task description. Keep the description very concise, exactly between 20 to 30 words long.
Title: ${title || "Untitled"}
Notes: ${description}`;
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    return NextResponse.json({ text: result.response.text() });
  } catch (error: any) {
    console.error("AI Refine Error:", error);
    return NextResponse.json({ message: "AI refinement failed" }, { status: 500 });
  }
}
