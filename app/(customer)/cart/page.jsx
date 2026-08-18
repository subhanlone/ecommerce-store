"use client";

import Link from "next/link";
import { useCartStore } from "@/store/cartStore";
import CartItem from "@/components/customer/CartItem";
import Button from "@/components/ui/Button";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-text-subtle">Your cart is empty.</p>
        <Link href="/products" className="mt-4 inline-block">
          <Button>Browse products</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Your Cart</h1>
      <div>
        {items.map((item) => (
          <CartItem key={item.productId} item={item} />
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <p className="text-lg font-semibold">Total: ${total.toFixed(2)}</p>
        <Link href="/checkout">
          <Button>Proceed to Checkout</Button>
        </Link>
      </div>
    </div>
  );
}
