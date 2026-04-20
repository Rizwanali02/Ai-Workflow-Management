import * as mongoose from "mongoose";
import dbConnect from "@/lib/db";
import { Project } from "@/models/Project";
import { Task } from "@/models/Task";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { createNotification } from "@/lib/notifications";
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const projectId = new mongoose.Types.ObjectId(id);
    const projectData = await Project.aggregate([
      { $match: { _id: projectId } },
      {
        $lookup: {
          from: "users",
          localField: "managerId",
          foreignField: "_id",
          as: "managerId"
        }
      },
      { $unwind: "$managerId" },
      {
        $lookup: {
          from: "users",
          localField: "members",
          foreignField: "_id",
          as: "members"
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "createdBy",
          foreignField: "_id",
          as: "createdBy"
        }
      },
      { $unwind: "$createdBy" },
      {
        $lookup: {
          from: "tasks",
          localField: "_id",
          foreignField: "projectId",
          pipeline: [
            { $sort: { createdAt: -1 } },
            {
              $lookup: {
                from: "users",
                localField: "assignedTo",
                foreignField: "_id",
                as: "assignedTo"
              }
            },
            { $unwind: { path: "$assignedTo", preserveNullAndEmptyArrays: true } },
            {
              $lookup: {
                from: "comments",
                localField: "_id",
                foreignField: "taskId",
                pipeline: [
                  {
                    $lookup: {
                      from: "users",
                      localField: "userId",
                      foreignField: "_id",
                      as: "userId"
                    }
                  },
                  { $unwind: "$userId" },
                  { $sort: { createdAt: 1 } }
                ],
                as: "comments"
              }
            }
          ],
          as: "tasks"
        }
      }
    ]);
    if (!projectData || projectData.length === 0) {
      return NextResponse.json({ message: "Project not found" }, { status: 404 });
    }
    const { tasks, ...project } = projectData[0];
    return NextResponse.json({ project, tasks });
  } catch (error) {
    console.error("Project Detail API Error:", error);
    return NextResponse.json({ message: "Error fetching project details" }, { status: 500 });
  }
}
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const body = await req.json();
    await dbConnect();
    const project = await Project.findById(id);
    if (!project) return NextResponse.json({ message: "Project not found" }, { status: 404 });
    const isManager = project.managerId.toString() === session.user.id.toString();
    const isAdmin = session.user.role === "admin";
    if (!isAdmin && !isManager) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const previousMemberIds = project.members.map((m: any) => m.toString());
    const updatedProject = await Project.findByIdAndUpdate(id, body, { new: true });
    if (body.members && Array.isArray(body.members)) {
      const newMemberIds = body.members.filter(
        (memberId: string) => !previousMemberIds.includes(memberId)
      );
      for (const memberId of newMemberIds) {
        await createNotification(
          memberId,
          "Added to Project",
          `You have been added to project: ${project.name}`,
          "assigned"
        );
      }
    }
    return NextResponse.json(updatedProject);
  } catch (error) {
    return NextResponse.json({ message: "Error updating project" }, { status: 500 });
  }
}
