import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: notificationId } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId: session.user.id.toString() },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
        return NextResponse.json({ message: "Notification not found" }, { status: 404 });
    }
    return NextResponse.json(notification);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
