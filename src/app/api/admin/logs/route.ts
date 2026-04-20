import dbConnect from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    await dbConnect();
    const logs = await ActivityLog.find({})
      .populate("userId", "name role")
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json(logs);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
