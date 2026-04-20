import dbConnect from "@/lib/db";
import { Task } from "@/models/Task";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
import { Project } from "@/models/Project";
const getValidId = (id: any): string => {
    if (!id) return "";
    if (typeof id === 'string') return id;
    if (typeof id === 'object') {
        if (id.buffer) {
            const bytes = Object.values(id.buffer);
            if (bytes.length > 0) return Buffer.from(bytes as number[]).toString('hex');
        }
        if (id.data) return Buffer.from(id.data).toString('hex');
    }
    return String(id);
};
export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get("projectId");
    await dbConnect();
    let query: any = {};
    if (projectId) query.projectId = projectId;
    const userId = getValidId(session.user.id);
    if (session.user.role === "employee") {
      query.$or = [{ assignedTo: userId }, { createdBy: userId }];
    } else if (session.user.role === "manager") {
      const managedProjects = await Project.find({ managerId: userId }).select("_id");
      const projectIds = managedProjects.map(p => p._id);
      query.projectId = { $in: projectIds };
    }
    const tasks = await Task.find(query)
      .populate("assignedTo", "name email")
      .populate("projectId", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 });
    return NextResponse.json(tasks);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching tasks" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await dbConnect();
    const taskData = {
      ...body,
      createdBy: getValidId(session.user.id),
      status: session.user.role === "employee" ? "pending_approval" : (body.status || "todo"),
      isApproved: session.user.role !== "employee"
    };
    const task = await Task.create(taskData);
    if (body.assignedTo) {
      await createNotification(
        body.assignedTo,
        "New Task Assigned",
        `You have been assigned to task: ${body.title}`,
        "assigned"
      );
    }
    if (session.user.role === "employee") {
        const project = await Project.findById(body.projectId);
        if (project) {
            await createNotification(
                project.managerId.toString(),
                "Task Approval Requested",
                `${session.user.name} created a new task: ${body.title} in project ${project.name}`,
                "task_created"
            );
        }
    }
    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Error creating task" }, { status: 500 });
  }
}
