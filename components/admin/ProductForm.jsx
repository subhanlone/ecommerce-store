"use client";

import { useState } from "react";
import { useForm, Controller, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { productSchema } from "@/lib/validation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ImageUpload from "@/components/admin/ImageUpload";

export default function ProductForm({ categories, initialData, productId }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      price: 0,
      category: categories[0]?._id || "",
      stock: 0,
      images: [],
      variants: [],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "variants" });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const url = productId ? `/api/products/${productId}` : "/api/products";
    const method = productId ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(result.error || "Something went wrong");
      return;
    }

    toast.success(productId ? "Product updated" : "Product created");
    router.push("/admin/products");
    router.refresh();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-xl flex-col gap-4">
      <Input label="Name" id="name" error={errors.name?.message} {...register("name")} />

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium text-neutral-700">
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-xs text-red-600">{errors.description.message}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Price"
          id="price"
          type="number"
          step="0.01"
          error={errors.price?.message}
          {...register("price")}
        />
        <Input
          label="Stock"
          id="stock"
          type="number"
          error={errors.stock?.message}
          {...register("stock")}
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="category" className="text-sm font-medium text-neutral-700">
          Category
        </label>
        <select
          id="category"
          className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
          {...register("category")}
        >
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
        {errors.category && <p className="text-xs text-red-600">{errors.category.message}</p>}
      </div>

      <Controller
        name="images"
        control={control}
        render={({ field }) => <ImageUpload images={field.value} onChange={field.onChange} />}
      />

      <div className="flex flex-col gap-2">
        <label className="text-sm font-medium text-neutral-700">
          Variants (optional — e.g. Size: M, Color: Red)
        </label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2">
            <input
              placeholder="Name (e.g. Size)"
              className="w-1/3 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
              {...register(`variants.${index}.name`)}
            />
            <input
              placeholder="Value (e.g. M)"
              className="w-1/3 rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
              {...register(`variants.${index}.value`)}
            />
            <button
              type="button"
              onClick={() => remove(index)}
              className="text-sm text-red-600 hover:underline"
              aria-label={`Remove variant ${index + 1}`}
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => append({ name: "", value: "" })}
          className="self-start text-sm text-accent hover:underline"
        >
          + Add variant
        </button>
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "Saving..." : productId ? "Update Product" : "Create Product"}
      </Button>
    </form>
  );
}
