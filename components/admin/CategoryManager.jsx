"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { categorySchema } from "@/lib/validation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(categorySchema) });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(result.error || "Something went wrong");
      return;
    }

    toast.success("Category added");
    reset();
    router.refresh();
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setEditValue(category.name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEdit = async (id) => {
    if (!editValue.trim()) {
      toast.error("Name is required");
      return;
    }

    setSavingEdit(true);
    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editValue.trim() }),
    });
    const result = await res.json();
    setSavingEdit(false);

    if (!res.ok) {
      toast.error(result.error || "Failed to update category");
      return;
    }

    toast.success("Category updated");
    setEditingId(null);
    router.refresh();
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this category? Products in it will not be deleted.")) return;
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete category");
      return;
    }
    toast.success("Category deleted");
    router.refresh();
  };

  return (
    <div className="flex max-w-xl flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex items-end gap-3">
        <Input
          label="New category name"
          id="name"
          error={errors.name?.message}
          {...register("name")}
        />
        <Button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add"}
        </Button>
      </form>

      <table className="w-full border-collapse overflow-hidden rounded-lg border border-neutral-200 bg-white text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Slug</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isEditing = editingId === category._id;
            return (
              <tr key={category._id} className="border-t border-neutral-200">
                <td className="px-4 py-2">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full rounded-md border border-neutral-300 px-2 py-1"
                      autoFocus
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td className="px-4 py-2 text-neutral-500">{category.slug}</td>
                <td className="px-4 py-2">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(category._id)}
                        disabled={savingEdit}
                        className="text-accent hover:underline disabled:opacity-50"
                      >
                        Save
                      </button>
                      <button type="button" onClick={cancelEdit} className="text-neutral-500 hover:underline">
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="text-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(category._id)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
