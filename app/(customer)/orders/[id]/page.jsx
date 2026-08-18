import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { auth } from "@/auth";
import StatusBadge from "@/components/ui/StatusBadge";
import OrderProgress from "@/components/ui/OrderProgress";

export default async function OrderDetailPage({ params }) {
  const { id } = await params;
  const session = await auth();

  await connectDB();
  const order = await Order.findById(id).lean();

  if (!order) {
    notFound();
  }

  const isOwner = order.user?.toString() === session.user.id;
  if (!isOwner && session.user.role !== "admin") {
    redirect("/orders");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Order #{order._id.toString().slice(-8)}
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <StatusBadge status={order.status} size="md" />
      </div>

      <div className="mb-6 rounded-xl border border-line bg-surface p-5">
        <OrderProgress status={order.status} />
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-line bg-surface">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 text-sm last:border-b-0"
          >
            <span className="min-w-0 text-text">
              {item.name} <span className="text-text-subtle">&times; {item.qty}</span>
            </span>
            <span className="tabular shrink-0 font-medium text-text">
              ${(item.price * item.qty).toFixed(2)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t-2 border-line bg-surface-muted px-4 py-3 font-semibold text-text">
          <span>Total</span>
          <span className="tabular">${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-xl border border-line bg-surface p-5">
        <h2 className="label-caps mb-2 text-[10px] text-text-subtle">Shipping address</h2>
        <p className="text-sm leading-relaxed text-text-muted">
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 ? `, ${order.shippingAddress.line2}` : ""}
          <br />
          {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
          {order.shippingAddress.postalCode}
          <br />
          {order.shippingAddress.country}
          <br />
          Phone: {order.shippingAddress.phone}
        </p>
      </div>

      <p className="mt-4 text-xs text-text-subtle">Payment method: {order.paymentMethod}</p>
    </div>
  );
}
