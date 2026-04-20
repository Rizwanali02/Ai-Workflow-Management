import mongoose, { Schema, Document, model, models } from "mongoose";
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: "task_created" | "status_changed" | "assigned";
  isRead: boolean;
  createdAt: Date;
}
const NotificationSchema = new Schema<INotification>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["task_created", "status_changed", "assigned"], 
    required: true 
  },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
export const Notification = models.Notification || model<INotification>("Notification", NotificationSchema);
