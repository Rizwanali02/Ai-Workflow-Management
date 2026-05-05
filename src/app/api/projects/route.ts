import dbConnect from "@/lib/db";
import { Project } from "@/models/Project";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
const getValidId = (id: any): string => {
  if (!id) return "";
  if (typeof id === 'string') return id;
  if (typeof id === 'object') {
    if (id.buffer) {
      const bytes = Object.values(id.buffer);
      if (bytes.length > 0) return Buffer.from(bytes as number[]).toString('hex');
    }
    if (id.data) {
      return Buffer.from(id.data).toString('hex');
    }
  }
  return String(id);
};
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    User.init();
    let projects;
    if (session.user.role === "admin") {
      projects = await Project.find({})
        .populate("managerId", "name email profileImg")
        .populate("members", "name email profileImg");
    } else {
      const userId = getValidId(session.user.id);
      projects = await Project.find({
        $or: [
          { managerId: userId },
          { members: userId }
        ]
      })
        .populate("managerId", "name email profileImg")
        .populate("members", "name email profileImg");
    }
    return NextResponse.json(projects);
  } catch (error: any) {
    return NextResponse.json({ message: "Error fetching projects" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role === "employee") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const { name, description, managerId, members } = await req.json();
    await dbConnect();
    const project = await Project.create({
      name,
      description,
      managerId,
      members: members || [],
      createdBy: getValidId(session.user.id)
    });
    await createNotification(
      managerId,
      "New Project Assigned",
      `You have been assigned as the manager for project: ${name}`,
      "assigned"
    );
    if (members && members.length > 0) {
      for (const memberId of members) {
        await createNotification(
          memberId,
          "New Project Access",
          `You have been added to project: ${name}`,
          "assigned"
        );
      }
    }
    return NextResponse.json(project, { status: 201 });
  } catch (error: any) {
    console.error("Project Creation Error:", error);
    return NextResponse.json({
      message: "Error creating project",
      error: error.message || "Unknown error"
    }, { status: 500 });
  }
}
