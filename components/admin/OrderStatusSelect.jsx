"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ORDER_TRANSITIONS } from "@/lib/constants";
import { STATUS_META } from "@/components/ui/StatusBadge";

export default function OrderStatusSelect({ orderId, currentStatus }) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [saving, setSaving] = useState(false);

  const handleChange = async (e) => {
    const next = e.target.value;
    const previous = status;

    // Track the value in state rather than leaving it uncontrolled, so the
    // control can carry the matching status colour and can be put back if the
    // request fails instead of showing a status the server never accepted.
    setStatus(next);
    setSaving(true);

    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      if (!res.ok) {
        setStatus(previous);
        toast.error("Failed to update status");
        return;
      }
      toast.success(`Order marked ${next}`);
      router.refresh();
    } catch {
      setStatus(previous);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  const meta = STATUS_META[status];
  const availableStatuses = [status, ...(ORDER_TRANSITIONS[status] || [])];

  return (
    <select
      aria-label="Update order status"
      value={status}
      disabled={saving}
      onChange={handleChange}
      className="h-9 cursor-pointer rounded-full border-0 px-3 text-sm font-medium transition-opacity disabled:opacity-50"
      style={{ backgroundColor: `var(${meta.bg})`, color: `var(${meta.fg})` }}
    >
      {availableStatuses.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}
