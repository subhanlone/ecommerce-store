"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ORDER_STATUSES } from "@/lib/constants";

export default function OrderStatusSelect({ orderId, currentStatus }) {
  const router = useRouter();

  const handleChange = async (e) => {
    const res = await fetch(`/api/orders/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: e.target.value }),
    });
    if (!res.ok) {
      toast.error("Failed to update status");
      return;
    }
    toast.success("Status updated");
    router.refresh();
  };

  return (
    <select
      aria-label="Update order status"
      defaultValue={currentStatus}
      onChange={handleChange}
      className="rounded-md border border-neutral-300 px-3 py-1.5 text-sm"
    >
      {ORDER_STATUSES.map((status) => (
        <option key={status} value={status}>
          {status}
        </option>
      ))}
    </select>
  );
}
