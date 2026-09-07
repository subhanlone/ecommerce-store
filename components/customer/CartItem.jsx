"use client";

import Image from "next/image";
import { useCartStore } from "@/store/cartStore";
import { formatPrice } from "@/lib/utils";

export default function CartItem({ item }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex items-center gap-4 border-b border-line py-4">
      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-surface-muted">
        {item.image ? (
          <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-medium text-text">{item.name}</p>
        <p className="tabular text-sm text-text-subtle">{formatPrice(item.price)}</p>
      </div>

      {/* Was unlabelled: a bare number spinner announces nothing, and there is
          one per row, so "which quantity?" was unanswerable without sight. */}
      <input
        type="number"
        min={1}
        max={item.stock || undefined}
        value={item.qty}
        aria-label={`Quantity for ${item.name}`}
        onChange={(e) => updateQty(item.productId, Number(e.target.value) || 1)}
        className="tabular h-11 w-16 shrink-0 rounded-lg border border-line-strong bg-surface px-2 text-center text-sm text-text"
      />

      <p className="tabular w-20 shrink-0 text-right font-medium text-text">
        {formatPrice(item.price * item.qty)}
      </p>

      <button
        type="button"
        onClick={() => removeItem(item.productId)}
        aria-label={`Remove ${item.name} from cart`}
        className="shrink-0 text-sm font-medium text-danger hover:underline"
      >
        Remove
      </button>
    </div>
  );
}
