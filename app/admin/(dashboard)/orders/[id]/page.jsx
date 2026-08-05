import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

export default async function AdminOrderDetailPage({ params }) {
  const { id } = await params;

  await connectDB();
  const order = await Order.findById(id).populate("user", "name email").lean();

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order._id.toString().slice(-8)}</h1>
          <p className="text-sm text-neutral-500">
            {order.user?.name} &middot; {order.user?.email}
          </p>
        </div>
        <OrderStatusSelect orderId={order._id.toString()} currentStatus={order.status} />
      </div>

      <div className="mb-6 rounded-lg border border-neutral-200 bg-white">
        {order.items.map((item, i) => (
          <div
            key={i}
            className="flex items-center justify-between border-b border-neutral-200 px-4 py-3 text-sm last:border-b-0"
          >
            <span>
              {item.name} &times; {item.qty}
            </span>
            <span className="font-medium">${(item.price * item.qty).toFixed(2)}</span>
          </div>
        ))}
        <div className="flex items-center justify-between px-4 py-3 font-semibold">
          <span>Total</span>
          <span>${order.totalAmount.toFixed(2)}</span>
        </div>
      </div>

      <div className="rounded-lg border border-neutral-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-neutral-700">Shipping Address</h2>
        <p className="text-sm text-neutral-600">
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
