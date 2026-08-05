import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/auth-helpers";

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!file) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = await file.arrayBuffer();
  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "ecommerce-store",
  });

  return Response.json({ url: result.secure_url });
}
