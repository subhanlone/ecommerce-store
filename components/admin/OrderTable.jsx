"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ORDER_STATUSES } from "@/lib/constants";
import { STATUS_META } from "@/components/ui/StatusBadge";

export default function OrderTable({ orders }) {
  const router = useRouter();
  // Which row is mid-request, so its control can show that it's busy rather
  // than silently accepting a second change.
  const [pendingId, setPendingId] = useState(null);

  const handleStatusChange = async (id, status) => {
    setPendingId(id);
    try {
      const res = await fetch(`/api/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        return;
      }
      toast.success(`Order #${id.slice(-8)} marked ${status}`);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-line">
      <table className="w-full min-w-[720px] border-collapse bg-surface text-sm">
        <thead className="bg-surface-muted text-left">
          <tr className="label-caps text-[10px] text-text-subtle">
            <th className="px-4 py-3 font-medium">Order</th>
            <th className="px-4 py-3 font-medium">Customer</th>
            <th className="px-4 py-3 font-medium">Items</th>
            <th className="px-4 py-3 font-medium">Date</th>
            <th className="px-4 py-3 font-medium">Total</th>
            <th className="px-4 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const meta = STATUS_META[order.status];
            const busy = pendingId === order._id;

            return (
              <tr key={order._id} className="border-t border-line hover:bg-surface-muted/60">
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/orders/${order._id}`}
                    className="font-medium text-accent hover:underline"
                  >
                    #{order._id.slice(-8)}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-text">{order.user?.name || "Unknown"}</span>
                  <br />
                  <span className="text-xs text-text-subtle">{order.user?.email}</span>
                </td>
                <td className="px-4 py-3 text-text-muted">
                  {order.items.length} item{order.items.length === 1 ? "" : "s"}
                </td>
                <td className="px-4 py-3 tabular text-text-muted">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 tabular font-medium text-text">
                  ${order.totalAmount.toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  {/*
                    The status was a plain grey dropdown, so scanning the table
                    told you nothing — you had to read every row. Carrying the
                    status colour on the control itself makes the column
                    scannable while keeping one control instead of a badge
                    sitting next to a duplicate select.
                  */}
                  <select
                    aria-label={`Status for order #${order._id.slice(-8)}`}
                    value={order.status}
                    disabled={busy}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="rounded-full border-0 px-3 py-1.5 text-xs font-medium transition-opacity disabled:opacity-50"
                    style={{
                      backgroundColor: `var(${meta.bg})`,
                      color: `var(${meta.fg})`,
                    }}
                  >
                    {ORDER_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
