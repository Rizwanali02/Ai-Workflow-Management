import mongoose, { Schema, Document, model, models } from "mongoose";
export interface IActivityLog extends Document {
  userId: mongoose.Types.ObjectId;
  action: string;
  entityType: "task" | "project";
  entityId: mongoose.Types.ObjectId;
  createdAt: Date;
}
const ActivityLogSchema = new Schema<IActivityLog>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },
  entityType: { 
    type: String, 
    enum: ["task", "project"], 
    required: true 
  },
  entityId: { type: Schema.Types.ObjectId, required: true },
  createdAt: { type: Date, default: Date.now },
});
export const ActivityLog = models.ActivityLog || model<IActivityLog>("ActivityLog", ActivityLogSchema);
