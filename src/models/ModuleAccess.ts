import mongoose, { Schema, Document, model, models } from "mongoose";
export interface IModuleAccess extends Document {
  moduleName: string;
  allowedRoles: ("admin" | "manager" | "employee")[];
}
const ModuleAccessSchema = new Schema<IModuleAccess>({
  moduleName: { type: String, required: true, unique: true },
  allowedRoles: [{ 
    type: String, 
    enum: ["admin", "manager", "employee"] 
  }],
});
export const ModuleAccess = models.ModuleAccess || model<IModuleAccess>("ModuleAccess", ModuleAccessSchema);
