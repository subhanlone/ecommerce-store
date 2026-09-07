import cloudinary from "@/lib/cloudinary";

export function cloudinaryPublicId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" || parsed.hostname !== "res.cloudinary.com") return null;

    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts[0] !== process.env.CLOUDINARY_CLOUD_NAME) return null;
    const uploadIndex = parts.indexOf("upload");
    if (uploadIndex < 0) return null;

    const afterUpload = parts.slice(uploadIndex + 1);
    const versionIndex = afterUpload.findIndex((part) => /^v\d+$/.test(part));
    const assetParts = versionIndex >= 0 ? afterUpload.slice(versionIndex + 1) : afterUpload;
    if (!assetParts.length) return null;

    assetParts[assetParts.length - 1] = assetParts[assetParts.length - 1].replace(/\.[^.]+$/, "");
    return decodeURIComponent(assetParts.join("/"));
  } catch {
    return null;
  }
}

export async function destroyCloudinaryImages(urls) {
  const publicIds = [...new Set(urls.map(cloudinaryPublicId).filter(Boolean))];
  const failures = [];

  for (const publicId of publicIds) {
    try {
      const response = await cloudinary.uploader.destroy(publicId, {
        resource_type: "image",
        invalidate: true,
      });
      if (!["ok", "not found"].includes(response.result)) {
        failures.push({ publicId, result: response.result });
      }
    } catch (error) {
      failures.push({ publicId, error: error.message });
    }
  }

  return failures;
}
