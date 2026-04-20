import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const notifications = await Notification.find({ userId: session.user.id.toString() })
      .sort({ createdAt: -1 })
      .limit(50);
    return NextResponse.json(notifications);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
