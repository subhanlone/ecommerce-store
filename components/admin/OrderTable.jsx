"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ORDER_STATUSES } from "@/lib/constants";

export default function OrderTable({ orders }) {
  const router = useRouter();

  const handleStatusChange = async (id, status) => {
    const res = await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    router.refresh();
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-neutral-200">
      <table className="w-full min-w-[640px] border-collapse bg-white text-sm">
        <thead className="bg-neutral-50 text-left text-neutral-600">
          <tr>
            <th className="px-4 py-2">Order</th>
            <th className="px-4 py-2">Customer</th>
            <th className="px-4 py-2">Items</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Total</th>
            <th className="px-4 py-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order._id} className="border-t border-neutral-200">
              <td className="px-4 py-2">
                <Link href={`/admin/orders/${order._id}`} className="text-accent hover:underline">
                  #{order._id.slice(-8)}
                </Link>
              </td>
              <td className="px-4 py-2">
                {order.user?.name || "Unknown"}
                <br />
                <span className="text-xs text-neutral-500">{order.user?.email}</span>
              </td>
              <td className="px-4 py-2 text-neutral-600">
                {order.items.length} item{order.items.length === 1 ? "" : "s"}
              </td>
              <td className="px-4 py-2">{new Date(order.createdAt).toLocaleDateString()}</td>
              <td className="px-4 py-2">${order.totalAmount.toFixed(2)}</td>
              <td className="px-4 py-2">
                <select
                  aria-label={`Update status for order #${order._id.slice(-8)}`}
                  value={order.status}
                  onChange={(e) => handleStatusChange(order._id, e.target.value)}
                  className="rounded-md border border-neutral-300 px-2 py-1 text-xs"
                >
                  {ORDER_STATUSES.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
