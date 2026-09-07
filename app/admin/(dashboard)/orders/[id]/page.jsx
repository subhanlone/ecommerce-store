import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";
import OrderProgress from "@/components/ui/OrderProgress";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id).populate("user", "name email").lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            Order #{order._id.toString().slice(-8)}
          </h1>
          <p className="mt-0.5 text-sm text-text-muted">
            {order.user?.name} &middot; {order.user?.email}
          </p>
          <p className="mt-0.5 text-sm text-text-subtle">
            Placed on {formatDate(order.createdAt)}
          </p>
        </div>
        <OrderStatusSelect orderId={order._id.toString()} currentStatus={order.status} />
      </div>

      {/* Same lifecycle view the customer sees, so an admin answering a
          "where is my order" question is looking at the same picture. */}
      <div className="mb-6 rounded-xl border border-line bg-surface p-5">
        <OrderProgress status={order.status} />
      </div>

      <div className="mb-6 overflow-hidden rounded-xl border border-line bg-surface">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between gap-4 border-b border-line px-4 py-3 text-sm last:border-b-0"
          >
            <span className="text-text">
              {item.name} <span className="text-text-subtle">&times; {item.qty}</span>
            </span>
            <span className="tabular shrink-0 font-medium text-text">
              {formatPrice(item.price * item.qty)}
            </span>
          </div>
        ))}
        <div className="flex items-center justify-between border-t-2 border-line bg-surface-muted px-4 py-3 font-semibold text-text">
          <span>Total</span>
          <span className="tabular">{formatPrice(order.totalAmount)}</span>
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
    </div>
  );
}
