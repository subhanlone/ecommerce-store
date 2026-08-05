"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";

export default function CartItem({ item }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-4 border-b border-neutral-200 py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : null}
      </div>
      <div className="flex-1">
        <p className="font-medium">{item.name}</p>
        <p className="text-sm text-neutral-500">${item.price.toFixed(2)}</p>
      </div>
      <input
        type="number"
        min={1}
        max={item.stock || undefined}
        value={item.qty}
        onChange={(e) => updateQty(item.productId, Number(e.target.value) || 1)}
        className="w-16 rounded-md border border-neutral-300 px-2 py-1 text-sm"
      />
      <p className="w-20 text-right font-medium">${(item.price * item.qty).toFixed(2)}</p>
      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        className="text-sm text-red-600 hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
