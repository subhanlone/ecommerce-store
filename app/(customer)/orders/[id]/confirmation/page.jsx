import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { isValidObjectId } from "@/lib/object-id";
import { formatDate, formatPrice } from "@/lib/utils";
import Order from "@/models/Order";
import StatusBadge from "@/components/ui/StatusBadge";
import { CheckCircleIcon } from "@/components/ui/icons";

export default async function OrderConfirmationPage({ params }) {
  const { id } = await params;
  const session = await auth();

  if (!session) {
    redirect(`/login?callbackUrl=/orders/${id}/confirmation`);
  }
  if (!isValidObjectId(id)) {
    notFound();
  }

  await connectDB();
  const order = await Order.findById(id).lean();

  if (!order || order.user?.toString() !== session.user.id) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:py-16">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent-subtle text-accent">
          <CheckCircleIcon className="h-8 w-8" aria-hidden="true" />
        </span>
        <p className="label-caps mt-5 text-[10px] text-accent">Order received</p>
        <h1 className="mt-2 text-3xl font-semibold text-text">Thank you for your order</h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-text-muted">
          Your order has been placed successfully. You can pay with cash when it is delivered.
        </p>
      </div>

      <section className="mt-8 overflow-hidden rounded-xl border border-line bg-surface" aria-labelledby="confirmation-summary">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-surface-muted px-5 py-4">
          <div>
            <h2 id="confirmation-summary" className="font-semibold text-text">
              Order #{order._id.toString().slice(-8)}
            </h2>
            <p className="mt-0.5 text-xs text-text-subtle">Placed on {formatDate(order.createdAt)}</p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="divide-y divide-line">
          {order.items.map((item, index) => (
            <div key={index} className="flex items-center justify-between gap-4 px-5 py-3 text-sm">
              <span className="min-w-0 text-text">
                {item.name} <span className="text-text-subtle">&times; {item.qty}</span>
              </span>
              <span className="tabular shrink-0 font-medium text-text">
                {formatPrice(item.price * item.qty)}
              </span>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t-2 border-line px-5 py-4 font-semibold text-text">
          <span>Total</span>
          <span className="tabular">{formatPrice(order.totalAmount)}</span>
        </div>
      </section>

      <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
        <Link
          href={`/orders/${order._id}`}
          className="inline-flex h-11 items-center justify-center rounded-lg bg-accent px-5 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover"
        >
          View order details
        </Link>
        <Link
          href="/products"
          className="inline-flex h-11 items-center justify-center rounded-lg border border-line-strong bg-surface px-5 text-sm font-medium text-text transition-colors hover:bg-surface-muted"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
