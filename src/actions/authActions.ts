"use server";

import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { encrypt, logout } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export async function loginUser(data: {
    email: string;
    password: string;
}) {
    try {
        const { email, password } = data;
        console.log("Login attempt-----:", data);

        if (!email || !password) {
            return {
                success: false,
                error: "Missing required fields",
            };
        }

        await dbConnect();

        const user = await User.findOne({ email });

        if (!user || !user.password) {
            return {
                success: false,
                error: "Invalid credentials",
            };
        }

        if (user.isDeleted) {
            return {
                success: false,
                error: "Your account has been deactivated.",
            };
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return {
                success: false,
                error: "Invalid credentials",
            };
        }

        const userForToken = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            profileImg: user.profileImg,
        };

        const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);

        const token = await encrypt({
            user: userForToken,
            expires,
        });

        (await cookies()).set("token", token, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return {
            success: true,
            user: userForToken,
        };
    } catch (error: any) {
        console.error("Login Error:", error);

        return {
            success: false,
            error: "Internal Server Error",
        };
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

export async function registerUser(data: {
    name: string;
    email: string;
    password: string;
    role?: string;
}) {
    try {
        const { name, email, password, role } = data;

        if (!name || !email || !password) {
            return {
                success: false,
                error: "Missing required fields",
            };
        }

        await dbConnect();

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return {
                success: false,
                error: "User already exists",
            };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || "employee",
        });

        const userForToken = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            profileImg: user.profileImg,
        };

        const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);

        const token = await encrypt({
            user: userForToken,
            expires,
        });

        (await cookies()).set("token", token, {
            expires,
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
        });

        return {
            success: true,
            user: userForToken,
        };
    } catch (error: any) {
        console.error("Register Error:", error);

        return {
            success: false,
            error: "Internal Server Error",
        };
    }

}