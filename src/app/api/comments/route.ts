import dbConnect from "@/lib/db";
import { Comment } from "@/models/Comment";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";
import { emitNewComment } from "@/lib/socket-server";
const getValidId = (id: any): string => {
    if (!id) return "";
    if (typeof id === 'string') return id;
    if (typeof id === 'object') {
        if (id.buffer) {
            const bytes = Object.values(id.buffer);
            if (bytes.length > 0) return Buffer.from(bytes as number[]).toString('hex');
        }
    }
    return String(id);
};
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get("taskId");
    if (!taskId) return NextResponse.json({ message: "Task ID is required" }, { status: 400 });
    await dbConnect();
    const comments = await Comment.find({ taskId })
      .populate("userId", "name avatar email role")
      .sort({ createdAt: 1 });
    return NextResponse.json(comments);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching comments" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { taskId, message, imageUrl } = await req.json();
    if (!taskId || !message) {
      return NextResponse.json({ message: "Task ID and message are required" }, { status: 400 });
    }
    await dbConnect();
    const comment = await Comment.create({
      taskId,
      userId: getValidId(session.user.id),
      message,
      imageUrl
    });
    const populatedComment = await Comment.findById(comment._id).populate("userId", "name avatar");
    emitNewComment(taskId, populatedComment);
    const task = await Task.findById(taskId);
    if (task && task.assignedTo && task.assignedTo.toString() !== getValidId(session.user.id)) {
        await createNotification(
            task.assignedTo.toString(),
            "New Comment",
            `${session.user.name} commented on task: ${task.title}`,
            "assigned"
        );
    }
    const project = await Project.findById(task?.projectId);
    if (project && project.managerId && project.managerId.toString() !== getValidId(session.user.id)) {
        await createNotification(
            project.managerId.toString(),
            "Task Comment",
            `${session.user.name} commented on "${task?.title}" in project ${project.name}`,
            "status_changed"
        );
    }
    return NextResponse.json(populatedComment, { status: 201 });
  } catch (error) {
    console.error("Comment API Error:", error);
    return NextResponse.json({ message: "Error adding comment" }, { status: 500 });
  }
}
