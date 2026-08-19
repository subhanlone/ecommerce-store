"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { TrashIcon, EditIcon } from "@/components/ui/icons";

export default function ProductTable({ products }) {
  const router = useRouter();
  // Holding the whole product, not just the id, so the dialog can name it.
  const [pending, setPending] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!pending) return;
    setDeleting(true);
    const res = await fetch(`/api/products/${pending._id}`, { method: "DELETE" });
    setDeleting(false);
    setPending(null);

    if (!res.ok) {
      toast.error("Failed to delete product");
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <>
      <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[640px] border-collapse bg-surface text-sm">
        <thead className="bg-surface-muted text-left">
          <tr className="label-caps text-[10px] text-text-subtle">
            <th className="px-4 py-3 font-medium">Name</th>
            <th className="px-4 py-3 font-medium">Category</th>
            <th className="px-4 py-3 font-medium">Price</th>
            <th className="px-4 py-3 font-medium">Stock</th>
            <th className="px-4 py-3 font-medium">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-t border-line hover:bg-surface-muted/60">
              <td className="px-4 py-3 font-medium text-text">{product.name}</td>
              <td className="px-4 py-3 text-text-muted">{product.category?.name || "—"}</td>
              <td className="tabular px-4 py-3 text-text">${product.price.toFixed(2)}</td>
              {/*
                Stock is the column an admin scans this table for. Calling out
                empty and nearly-empty lines means restocking doesn't depend on
                reading every row.
              */}
              <td className="tabular px-4 py-3">
                {product.stock === 0 ? (
                  <span className="font-medium text-danger">Out of stock</span>
                ) : product.stock <= 5 ? (
                  <span className="font-medium text-danger">{product.stock}</span>
                ) : (
                  <span className="text-text">{product.stock}</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="flex gap-1">
                  <Link
                    href={`/admin/products/edit/${product._id}`}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 font-medium text-accent transition-colors hover:bg-accent-subtle"
                  >
                    <EditIcon className="h-4 w-4" />
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPending(product)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-lg px-2.5 font-medium text-danger transition-colors hover:bg-danger-subtle"
                  >
                    <TrashIcon className="h-4 w-4" />
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>

      <ConfirmDialog
        open={!!pending}
        onOpenChange={(next) => !next && setPending(null)}
        title="Delete product?"
        description={
          pending
            ? `“${pending.name}” will be removed from the store. This cannot be undone.`
            : ""
        }
        confirmLabel="Delete product"
        onConfirm={handleDelete}
        loading={deleting}
      />
    </>
  );
}
