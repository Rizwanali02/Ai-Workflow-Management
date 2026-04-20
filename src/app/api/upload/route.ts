import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
  api_key: process.env.CLOUDINARY_CLIENT_API_KEY,
  api_secret: process.env.CLOUDINARY_CLIENT_API_SECRET,
});
export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ message: "No file uploaded" }, { status: 400 });
    }
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: "auto",
        folder: "workflow-comments",
      }, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Upload Error:", error);
    return NextResponse.json({ message: "Upload failed" }, { status: 500 });
  }
}
