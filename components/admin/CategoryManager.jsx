"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { categorySchema } from "@/lib/validation";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";

export default function CategoryManager({ categories }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  // The whole category, so the dialog can name it rather than say "this one".
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    const res = await fetch(`/api/categories/${pending._id}`, { method: "DELETE" });
    setDeleting(false);
    setPending(null);
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
        <Button type="submit" loading={submitting}>
          Add
        </Button>
      </form>

      <table className="w-full border-collapse overflow-hidden rounded-xl border border-line bg-surface text-sm">
        <thead className="bg-surface-muted text-left">
          <tr className="label-caps text-[10px] text-text-subtle">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Slug</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {categories.map((category) => {
            const isEditing = editingId === category._id;
            return (
              <tr key={category._id} className="border-t border-line">
                <td className="px-4 py-3 font-medium text-text">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      aria-label={`Rename ${category.name}`}
                      className="h-9 w-full rounded-lg border border-line-strong bg-surface px-2 text-text"
                      autoFocus
                    />
                  ) : (
                    category.name
                  )}
                </td>
                <td className="px-4 py-3 text-text-subtle">{category.slug}</td>
                <td className="px-4 py-3">
                  {isEditing ? (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => saveEdit(category._id)}
                        disabled={savingEdit}
                        className="font-medium text-accent hover:underline disabled:opacity-50"
                      >
                        {savingEdit ? "Saving…" : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="font-medium text-text-subtle hover:underline"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => startEdit(category)}
                        className="font-medium text-accent hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => setPending(category)}
                        className="font-medium text-danger hover:underline"
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

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(next) => !next && setPending(null)}
        title="Delete category?"
        description={
          pending
            ? `“${pending.name}” will be removed. Products in it are kept and simply lose their category.`
            : ""
        }
        confirmLabel="Delete category"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </div>
  );
}
