"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import Button from "@/components/ui/Button";

export default function AddToCartButton({ product }) {
  const addItem = useCartStore((s) => s.addItem);
  const toggleWishlist = useWishlistStore((s) => s.toggleItem);
  const isWishlisted = useWishlistStore((s) => s.isWishlisted(product._id));
  const [qty, setQty] = useState(1);

  // The wishlist store rehydrates from localStorage after mount, so it's
  // always empty during SSR. Ignoring it until mounted keeps the first
  // client render matching the server and avoids a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const wishlisted = mounted && isWishlisted;

  return (
    <div className="flex items-center gap-3">
      <input
        type="number"
        min={1}
        max={product.stock || 1}
        value={qty}
        onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
        className="w-16 rounded-md border border-neutral-300 px-2 py-2 text-sm"
        disabled={product.stock === 0}
      />
      <Button
        disabled={product.stock === 0}
        onClick={() => {
          addItem(product, qty);
          toast.success("Added to cart");
        }}
      >
        Add to Cart
      </Button>
      <button
        type="button"
        onClick={() => {
          toggleWishlist(product);
          toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist");
        }}
        className="rounded-md border border-neutral-300 px-3 py-2 text-sm"
      >
        {wishlisted ? "♥ Wishlisted" : "♡ Wishlist"}
      </button>
    </div>
  );
}
