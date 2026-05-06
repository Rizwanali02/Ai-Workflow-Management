"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { getSession, logout } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getUserProfile(userId: string) {
  try {
    await dbConnect();
    const user = await User.findById(userId).select("-password").lean();
    if (!user) return { success: false, error: "User not found" };
    return { success: true, user: JSON.parse(JSON.stringify(user)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateProfile(userId: string, data: { name?: string; profileImg?: string }) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user) return { success: false, error: "Unauthorized" };

    const isAdmin = session.user.role === "admin";
    const isOwnProfile = session.user.id === userId || session.user._id === userId;

    if (!isAdmin && !isOwnProfile) {
      return { success: false, error: "Forbidden" };
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: data },
      { returnDocument: 'after' }
    ).select("-password").lean();

    if (!updatedUser) {
      return { success: false, error: "User not found" };
    }

    if (isOwnProfile) {
      const { login } = await import("@/lib/auth");
      await login({
        ...session.user,
        name: updatedUser.name,
        profileImg: updatedUser.profileImg,
      });
    }

    revalidatePath(`/dashboard/profile/${userId}`);
    return { success: true, user: JSON.parse(JSON.stringify(updatedUser)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateUserRole(userId: string, role: string) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized or Forbidden" };
    }

    await User.findByIdAndUpdate(userId, { $set: { role } });

    if (session.user.id === userId || session.user._id === userId) {
      const { login } = await import("@/lib/auth");
      await login({
        ...session.user,
        role: role,
      });
    }

    revalidatePath(`/dashboard/profile/${userId}`);
    revalidatePath(`/dashboard/team`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function softDeleteUser(userId: string) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session?.user || session.user.role !== "admin") {
      return { success: false, error: "Unauthorized or Forbidden" };
    }

    await User.findByIdAndUpdate(userId, { $set: { isDeleted: true } });
    revalidatePath(`/dashboard/profile/${userId}`);
    revalidatePath(`/dashboard/team`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function getAllUsers() {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized", users: [] };

    const users = await User.find({ isDeleted: { $ne: true } }, "name email role profileImg").lean();

    const sanitizedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg
    }));

    return { success: true, users: sanitizedUsers };
  } catch (error: any) {
    return { success: false, error: error.message, users: [] };
  }
}

export async function getUsersByRole(roles: string | string[]) {
  try {
    await dbConnect();
    const session = await getSession();
    if (!session) return { success: false, error: "Unauthorized", users: [] };

    const roleArray = Array.isArray(roles) ? roles : [roles];
    const users = await User.find(
      {
        isDeleted: { $ne: true },
        role: { $in: roleArray },
      },
      "name email role profileImg"
    ).lean();

    const sanitizedUsers = users.map((user: any) => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,

    }));

    return { success: true, users: sanitizedUsers };
  } catch (error: any) {
    return { success: false, error: error.message, users: [] };
  }
}

export const logoutAction = async () => {
  try {
    await logout();
    return { success: true, message: "Logged out successfully" };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}