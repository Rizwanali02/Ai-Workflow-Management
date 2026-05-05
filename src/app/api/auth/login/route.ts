import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { encrypt } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }
    await dbConnect();
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }

    if (user.isDeleted) {
      return NextResponse.json(
        { message: "Your account has been deactivated." },
        { status: 403 }
      );
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 }
      );
    }
    const userForToken = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profileImg: user.profileImg,
    };
    const expires = new Date(Date.now() + 2 * 60 * 60 * 1000);
    const token = await encrypt({ user: userForToken, expires });
    const response = NextResponse.json(
      { message: "Logged in successfully", user: userForToken },
      { status: 200 }
    );
    response.cookies.set("token", token, {
      expires,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    return response;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
