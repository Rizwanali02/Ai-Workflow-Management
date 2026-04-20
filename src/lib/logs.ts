import dbConnect from "@/lib/db";
import { ActivityLog } from "@/models/ActivityLog";
export async function logActivity(userId: string, action: string, entityType: "task" | "project", entityId: string) {
  try {
    await dbConnect();
    await ActivityLog.create({
      userId,
      action,
      entityType,
      entityId,
    });
  } catch (error) {
    console.error("Activity Log Error:", error);
  }
}
