import dbConnect from "@/lib/db";
import { Notification } from "@/models/Notification";
import { emitNotification } from "@/lib/socket-server";
export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: "task_created" | "status_changed" | "assigned"
) {
  try {
    await dbConnect();
    const notification = await Notification.create({
      userId,
      title,
      message,
      type,
    });
    emitNotification(userId, notification.toObject());
    return notification;
  } catch (error) {
    console.error("Notification Error:", error);
  }
}
