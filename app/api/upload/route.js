import cloudinary from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/auth-helpers";

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const MIN_IMAGE_DIMENSION = 300;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

function hasValidSignature(bytes, type) {
  const data = new Uint8Array(bytes);
  if (type === "image/jpeg") return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  if (type === "image/png") return data.length >= 8 && data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47;
  if (type === "image/webp") {
    return data.length >= 12 &&
      String.fromCharCode(...data.slice(0, 4)) === "RIFF" &&
      String.fromCharCode(...data.slice(8, 12)) === "WEBP";
  }
  return false;
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "No file provided" }, { status: 400 });
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    return Response.json({ error: "Only JPEG, PNG, and WebP images are allowed" }, { status: 415 });
  }

  if (file.size > MAX_IMAGE_BYTES) {
    return Response.json({ error: "Image must be 5 MB or smaller" }, { status: 413 });
  }

  const bytes = await file.arrayBuffer();
  if (!hasValidSignature(bytes, file.type)) {
    return Response.json({ error: "File contents do not match the declared image type" }, { status: 400 });
  }

  const base64 = Buffer.from(bytes).toString("base64");
  const dataUri = `data:${file.type};base64,${base64}`;

  let result;
  try {
    result = await cloudinary.uploader.upload(dataUri, {
      folder: "ecommerce-store",
      resource_type: "image",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
      tags: ["ecommerce-store", "product"],
      transformation: [{ width: 1600, height: 1600, crop: "limit", quality: "auto:good" }],
    });
  } catch {
    return Response.json({ error: "Image upload failed" }, { status: 502 });
  }

  if (Math.min(result.width, result.height) < MIN_IMAGE_DIMENSION) {
    await cloudinary.uploader.destroy(result.public_id, {
      resource_type: "image",
      invalidate: true,
    });
    return Response.json(
      { error: `Image must be at least ${MIN_IMAGE_DIMENSION}px on both sides` },
      { status: 422 }
    );
  }

  return Response.json({ url: result.secure_url });
}
