import mongoose, { Schema, Document, model, models } from "mongoose";
export interface IComment extends Document {
  taskId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  imageUrl?: string;
  createdAt: Date;
}
const CommentSchema = new Schema<IComment>({
  taskId: { type: Schema.Types.ObjectId, ref: "Task", required: true },
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  message: { type: String, required: true },
  imageUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});
export const Comment = models.Comment || model<IComment>("Comment", CommentSchema);
