"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { shippingAddressSchema } from "@/lib/validation";
import { useCartStore } from "@/store/cartStore";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function CheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(shippingAddressSchema) });

  const onSubmit = async (shippingAddress) => {
    setSubmitting(true);
    const res = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ shippingAddress }),
    });
    const result = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      toast.error(result.error || "Could not place order");
      return;
    }

    setOrderPlaced(true);
    clear();
    toast.success("Order placed");
    router.push(`/orders/${result.order._id}`);
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-text-subtle">
        Your cart is empty.
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-4xl gap-8 px-4 py-8 md:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-semibold">Shipping Address</h1>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input label="Address line 1" id="line1" error={errors.line1?.message} {...register("line1")} />
          <Input label="Address line 2 (optional)" id="line2" {...register("line2")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="City" id="city" error={errors.city?.message} {...register("city")} />
            <Input label="State" id="state" error={errors.state?.message} {...register("state")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Postal code"
              id="postalCode"
              error={errors.postalCode?.message}
              {...register("postalCode")}
            />
            <Input label="Country" id="country" error={errors.country?.message} {...register("country")} />
          </div>
          <Input label="Phone" id="phone" error={errors.phone?.message} {...register("phone")} />
          <Button type="submit" loading={submitting}>
            {`Place order (COD) — $${total.toFixed(2)}`}
          </Button>
        </form>
      </div>

      <div>
        <h1 className="mb-4 text-xl font-semibold">Order Summary</h1>
        <div className="divide-y divide-line rounded-lg border border-line">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                {item.name} &times; {item.qty}
              </span>
              <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex items-center justify-between px-4 py-3 font-semibold">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
        <p className="mt-3 text-xs text-text-subtle">
          Payment method: Cash on Delivery. Online payment coming soon.
        </p>
      </div>
    </div>
  );
}
