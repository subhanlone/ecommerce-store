import { notFound, redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { auth } from "@/auth";

const STATUS_STYLES = {
  Pending: "bg-neutral-100 text-neutral-700",
  Processing: "bg-blue-100 text-blue-700",
  Shipped: "bg-amber-100 text-amber-700",
  Delivered: "bg-green-100 text-green-700",
  Cancelled: "bg-red-100 text-red-700",
};

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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Order #{order._id.toString().slice(-8)}</h1>
          <p className="text-sm text-neutral-500">
            Placed on {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_STYLES[order.status]}`}
        >
          {order.status}
        </span>
      </div>

      <div className="mb-6 rounded-lg border border-neutral-200">
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

      <div className="rounded-lg border border-neutral-200 p-4">
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

      <p className="mt-4 text-xs text-neutral-500">Payment method: {order.paymentMethod}</p>
    </div>
  );
}
