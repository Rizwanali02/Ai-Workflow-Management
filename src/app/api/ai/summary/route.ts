import { getGeminiModel } from "@/lib/gemini";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { Task } from "@/models/Task";
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(10);
    if (logs.length === 0) {
      return NextResponse.json({ summary: "No recent activity found. Start creating projects or tasks to see your AI summary!" });
    }
    const logSummary = logs.map(log => `${log.createdAt.toLocaleDateString()}: ${log.action}`).join("\n");
    const prompt = `Based on the following activity logs of a user in a workflow management system, generate a friendly "What happened while you were away" summary in 2-3 sentences. Mention the key progress made. Keep it very conversational and helpful.\n\nLogs:\n${logSummary}`;
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const summary = result.response.text();
    return NextResponse.json({ summary });
  } catch (error: any) {
    console.error("Gemini Summary Error (GET):", error);
    return NextResponse.json({ message: "AI summary failed" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || (session.user.role !== "admin" && session.user.role !== "manager")) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    const { projectId } = await req.json();
    if (!projectId) {
      return NextResponse.json({ message: "Project ID is required" }, { status: 400 });
    }
    await dbConnect();
    const logs = await ActivityLog.find({ entityType: "project", entityId: projectId })
      .sort({ createdAt: -1 })
      .limit(15);
    const tasks = await Task.find({ projectId }).select("title status priority").limit(20);
    if (logs.length === 0 && tasks.length === 0) {
      return new Response("No recent activity or tasks found. Start creating tasks to see your AI summary!");
    }
    const logSummary = logs.map(log => `${log.createdAt.toLocaleDateString()}: ${log.action}`).join("\n");
    const tasksSummary = tasks.map(task => `Task: ${task.title} - Status: ${task.status} - Priority: ${task.priority}`).join("\n");
    const prompt = `You are an expert project manager AI. Based on the following activity logs and tasks of a project, generate a concise summary in 3-4 sentences. State clearly what has been accomplished recently and what is currently stalled or pending. Format it beautifully.\n\nLogs:\n${logSummary}\n\nTasks:\n${tasksSummary}`;
    const model = getGeminiModel();
    const result = await model.generateContentStream(prompt);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const chunkText = chunk.text();
            if (chunkText) {
              controller.enqueue(encoder.encode(chunkText));
            }
          }
        } catch (err) {
          controller.error(err);
        } finally {
          controller.close();
        }
      }
    });
    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      }
    });
  } catch (error: any) {
    console.error("AI Summary Error (POST):", error);
    return NextResponse.json({ message: "AI summary failed" }, { status: 500 });
  }
}
