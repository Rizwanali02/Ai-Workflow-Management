import mongoose, { Schema, Document, model, models } from "mongoose";
export interface ITask extends Document {
  title: string;
  description: string;
  status: "pending_approval" | "todo" | "in_progress" | "review" | "done" | "rejected";
  priority: "low" | "medium" | "high";
  type: "bug" | "feature" | "task";
  projectId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId;
  assignedTo?: mongoose.Types.ObjectId;
  approvedBy?: mongoose.Types.ObjectId;
  isApproved: boolean;
  deadline?: Date;
  startTime?: Date;
  completionTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}
const TaskSchema = new Schema<ITask>({
  title: { type: String, required: true },
  description: { type: String },
  status: { 
    type: String, 
    enum: ["pending_approval", "todo", "in_progress", "review", "done", "rejected"],
    default: "pending_approval"
  },
  priority: { 
    type: String, 
    enum: ["low", "medium", "high"], 
    default: "medium" 
  },
  type: { 
    type: String, 
    enum: ["bug", "feature", "task"], 
    default: "task" 
  },
  projectId: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
  approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
  isApproved: { type: Boolean, default: false },
  deadline: { type: Date },
  startTime: { type: Date },
  completionTime: { type: Date },
}, { timestamps: true });
export const Task = models.Task || model<ITask>("Task", TaskSchema);
