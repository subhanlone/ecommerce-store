"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function ProductTable({ products }) {
  const router = useRouter();

  const handleDelete = async (id) => {
    if (!confirm("Delete this product?")) return;
    const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
    if (!res.ok) {
      toast.error("Failed to delete product");
      return;
    }
    toast.success("Product deleted");
    router.refresh();
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full min-w-[640px] border-collapse bg-white text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-600">
          <tr>
            <th className="px-4 py-2">Name</th>
            <th className="px-4 py-2">Category</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Stock</th>
            <th className="px-4 py-2"></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product._id} className="border-t border-neutral-200">
              <td className="px-4 py-2">{product.name}</td>
              <td className="px-4 py-2">{product.category?.name || "—"}</td>
              <td className="px-4 py-2">${product.price.toFixed(2)}</td>
              <td className="px-4 py-2">{product.stock}</td>
              <td className="flex gap-3 px-4 py-2">
                <Link href={`/admin/products/edit/${product._id}`} className="text-accent hover:underline">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => handleDelete(product._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
