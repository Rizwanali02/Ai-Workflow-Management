import { z } from "zod";
export const userSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(["admin", "manager", "employee"]),
});
export const projectSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  managerId: z.string(),
  members: z.array(z.string()).optional(),
});
export const taskSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]),
  type: z.enum(["bug", "feature", "task"]),
  projectId: z.string(),
  assignedTo: z.string().optional(),
  deadline: z.string().optional(),
});
