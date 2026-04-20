import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { name, email, password, role } = await request.json();
    if (!name || !email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    await dbConnect();
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "User already exists" },
        { status: 400 }
      );
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
    };
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); 
    const token = await encrypt({ user: userForToken, expires });
    const response = NextResponse.json(
      { message: "User created successfully", user: userForToken },
      { status: 201 }
    );
    response.cookies.set("token", token, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
