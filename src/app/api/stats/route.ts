import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    const userId = new mongoose.Types.ObjectId(session.user.id);
    const role = session.user.role;

    let totalProjects = 0;
    let activeTasks = 0;
    let completedTasks = 0;
    let totalUsers = 0;

    if (role === "admin") {
      const [projects, users, active, completed] = await Promise.all([
        Project.countDocuments({}),
        User.countDocuments({}),
        Task.countDocuments({ status: "in_progress" }),
        Task.countDocuments({ status: "done" })
      ]);

      totalProjects = projects;
      totalUsers = users;
      activeTasks = active;
      completedTasks = completed;
    }

    else if (role === "manager") {
      const projectIds = await Project.find({ managerId: userId }).distinct("_id");

      const [projects, active, completed] = await Promise.all([
        Project.countDocuments({ managerId: userId }),

        Task.countDocuments({
          projectId: { $in: projectIds },
          status: "in_progress"
        }),

        Task.countDocuments({
          projectId: { $in: projectIds },
          status: "done"
        })
      ]);

      totalProjects = projects;
      activeTasks = active;
      completedTasks = completed;
    }

    else if (role === "employee") {
      const [projects, active, completed] = await Promise.all([
        Project.countDocuments({ members: userId }),

        Task.countDocuments({
          assignedTo: userId,
          status: "in_progress"
        }),

        Task.countDocuments({
          assignedTo: userId,
          status: "done"
        })
      ]);

      totalProjects = projects;
      activeTasks = active;
      completedTasks = completed;
    }

    const stats = {
      totalUsers,
      totalProjects,
      activeTasks,
      completedTasks
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}