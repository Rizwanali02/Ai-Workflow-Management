import { getGeminiModel } from "@/lib/gemini";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { title, type } = await req.json();
    if (!title) {
        return NextResponse.json({ message: "Title is required" }, { status: 400 });
    }
    const prompt = `You are a professional project manager and technical writer. Create a professional project description brief for a ${type || 'task'} titled: "${title}". Keep the description very concise, exactly between 20 to 30 words long.`;
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const description = result.response.text();
    return NextResponse.json({ description });
  } catch (error: any) {
    console.error("Gemini Generation Error:", error);
    return NextResponse.json({ message: "AI generation failed" }, { status: 500 });
  }
}
