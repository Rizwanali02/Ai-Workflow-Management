import mongoose, { Schema, Document, model, models } from "mongoose";
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "admin" | "manager" | "employee";
  profileImg?: string;
  isDeleted: boolean;
  createdAt: Date;
}
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ["admin", "manager", "employee"], 
    default: "employee" 
  },
  profileImg: { type: String },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
if (models.User) {
  delete models.User;
}
export const User = model<IUser>("User", UserSchema);
