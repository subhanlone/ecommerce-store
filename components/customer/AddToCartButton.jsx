"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useHydrated } from "@/lib/useHydrated";
import Button from "@/components/ui/Button";
import { HeartIcon } from "@/components/ui/icons";

export default function AddToCartButton({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product._id));
  const [qty, setQty] = useState(1);

  // The wishlist store rehydrates from localStorage after mount, so it's
  // always empty during SSR. Ignoring it until hydrated keeps the first
  // client render matching the server and avoids a hydration mismatch.
  const wishlisted = useHydrated() && isWishlisted;

  const outOfStock = product.stock === 0;

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Was unlabelled — a bare number spinner gives a screen reader nothing
          to announce. The brief calls out labelled form controls directly. */}
      <input
        type="number"
        min={1}
        max={product.stock || 1}
        value={qty}
        aria-label="Quantity"
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        className="tabular h-11 w-16 rounded-lg border border-line-strong bg-surface px-2 text-center text-sm text-text disabled:opacity-50"
        disabled={outOfStock}
      />

      <Button
        disabled={outOfStock}
        onClick={() => {
          addItem(product, qty);
          toast.success("Added to cart");
        }}
      >
        Add to cart
      </Button>

      <button
        type="button"
        /* aria-pressed makes this a toggle rather than a button whose meaning
           you can only infer from whether the heart looks filled. */
        aria-pressed={wishlisted}
        onClick={() => {
          toggleWishlist(product);
          toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
        }}
        className={`inline-flex h-11 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors ${
          wishlisted
            ? "border-accent-border bg-accent-subtle text-accent"
            : "border-line-strong text-text-muted hover:bg-surface-muted hover:text-text"
        }`}
      >
        <HeartIcon className={`h-4 w-4 ${wishlisted ? "fill-current" : ""}`} />
        {wishlisted ? "Wishlisted" : "Wishlist"}
      </button>
    </div>
  );
}
