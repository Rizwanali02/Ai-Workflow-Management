import dbConnect from "@/lib/db";
import { User } from "@/models/User";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    await dbConnect();
    const users = await User.find({}, "name email role");
    const sanitizedUsers = users.map(user => ({
      _id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role
    }));
    return NextResponse.json(sanitizedUsers);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}
