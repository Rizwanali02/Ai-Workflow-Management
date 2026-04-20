import dbConnect from "@/lib/db";
import { Task } from "@/models/Task";
import { Project } from "@/models/Project";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { logActivity } from "@/lib/logs";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await dbConnect();
    const task = await Task.findById(taskId);
    if (!task) return NextResponse.json({ message: "Task not found" }, { status: 404 });
    const oldStatus = task.status;
    const newStatus = body.status;
    const project = await Project.findById(task.projectId);
    if (newStatus === "todo" && oldStatus === "pending_approval") {
        if (session.user.role === "employee") {
            return NextResponse.json({ message: "Only Managers can approve tasks" }, { status: 403 });
        }
        body.isApproved = true;
        body.approvedBy = session.user.id;
    }
    if (session.user.role === "employee") {
        if (newStatus === "done" || newStatus === "rejected") {
            return NextResponse.json({ message: "Only Managers can set task to Done or Rejected" }, { status: 403 });
        }
    }
    if (newStatus === "in_progress" && !task.startTime) {
      body.startTime = new Date();
    }
    if (newStatus === "done") {
      body.completionTime = new Date();
    }
    if (task.status === "done" && newStatus !== "done") {
      body.completionTime = null;
    }
    const updatedTask = await Task.findByIdAndUpdate(taskId, body, { new: true });
    await logActivity(
        session.user.id,
        `Changed status from ${oldStatus} to ${newStatus}`,
        "task",
        taskId
    );
    if (oldStatus !== newStatus) {
        if (session.user.role === "employee") {
            if (project) {
                await createNotification(
                    project.managerId.toString(),
                    "Task Status Updated",
                    `${session.user.name} changed status of "${task.title}" to ${newStatus.replace('_', ' ')}.`,
                    "status_changed"
                );
            }
        }
        if (session.user.role !== "employee" && task.assignedTo) {
             await createNotification(
                task.assignedTo.toString(),
                `Task ${newStatus.replace('_', ' ')}`,
                `Your task "${task.title}" has been updated to ${newStatus.replace('_', ' ')}.`,
                "status_changed"
            );
        }
    }
    return NextResponse.json(updatedTask);
  } catch (error) {
    return NextResponse.json({ message: "Error updating task" }, { status: 500 });
  }
}
