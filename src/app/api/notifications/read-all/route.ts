import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function PATCH() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    await Notification.updateMany(
      { userId: session.user.id.toString(), isRead: false },
      { isRead: true }
    );
    return NextResponse.json({ message: "All notifications marked as read" });
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
