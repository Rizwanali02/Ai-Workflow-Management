import dbConnect from "@/lib/db";
import { ModuleAccess } from "@/models/ModuleAccess";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
export async function GET() {
  try {
    await dbConnect();
    const access = await ModuleAccess.find({});
    return NextResponse.json(access);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (session?.user.role !== "admin") return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    const { moduleName, allowedRoles } = await req.json();
    await dbConnect();
    const updated = await ModuleAccess.findOneAndUpdate(
      { moduleName },
      { allowedRoles },
      { upsert: true, new: true }
    );
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error" }, { status: 500 });
  }
}
