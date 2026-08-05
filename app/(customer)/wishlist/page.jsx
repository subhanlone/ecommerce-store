"use client";

import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useWishlistStore } from "@/store/wishlistStore";
import { useCartStore } from "@/store/cartStore";
import Button from "@/components/ui/Button";

export default function WishlistPage() {
  const items = useWishlistStore((s) => s.items);
  const removeItem = useWishlistStore((s) => s.removeItem);
  const addToCart = useCartStore((s) => s.addItem);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-neutral-500">Your wishlist is empty.</p>
        <Link href="/products" className="mt-4 inline-block">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Your Wishlist</h1>
      <div>
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center gap-4 border-b border-neutral-200 py-4"
          >
            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100">
              {item.image ? (
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="80px" />
              ) : null}
            </div>
            <div className="flex-1">
              <Link href={`/products/${item.productId}`} className="font-medium hover:text-accent">
                {item.name}
              </Link>
              <p className="text-sm text-neutral-500">${item.price.toFixed(2)}</p>
            </div>
            <Button
              variant="secondary"
              onClick={() => {
                addToCart({ _id: item.productId, name: item.name, price: item.price, images: [item.image] }, 1);
                toast.success("Added to cart");
              }}
            >
              Add to Cart
            </Button>
            <button
              type="button"
              onClick={() => removeItem(item.productId)}
              className="text-sm text-red-600 hover:underline"
            >
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
