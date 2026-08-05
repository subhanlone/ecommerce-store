"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

export default function ImageUpload({ images, onChange }) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Upload failed");
      onChange([...images, result.url]);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <label className="text-sm font-medium text-neutral-700">Product Images</label>
      <div className="flex flex-wrap gap-3">
        {images.map((url, i) => (
          <div key={url} className="relative h-20 w-20 overflow-hidden rounded-md border border-neutral-200">
            <Image src={url} alt="" fill className="object-cover" sizes="80px" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, idx) => idx !== i))}
              className="absolute right-0 top-0 bg-black/60 px-1 text-xs text-white"
            >
              &times;
            </button>
          </div>
        ))}
        <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-md border border-dashed border-neutral-300 text-xs text-neutral-500 hover:border-accent">
          {uploading ? "..." : "+ Add"}
          <input type="file" accept="image/*" className="hidden" onChange={handleFile} disabled={uploading} />
        </label>
      </div>
    </div>
  );
}
