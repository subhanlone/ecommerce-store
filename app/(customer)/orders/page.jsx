import Link from "next/link";
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

export default async function OrderHistoryPage() {
  const session = await auth();

  await connectDB();
  const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-semibold">Your Orders</h1>

      {orders.length === 0 ? (
        <p className="text-neutral-500">You haven&apos;t placed any orders yet.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="flex items-center justify-between rounded-lg border border-neutral-200 bg-white p-4 hover:shadow-sm"
            >
              <div>
                <p className="font-medium">Order #{order._id.toString().slice(-8)}</p>
                <p className="text-sm text-neutral-500">
                  {new Date(order.createdAt).toLocaleDateString()} &middot; {order.items.length} item(s)
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-semibold">${order.totalAmount.toFixed(2)}</span>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[order.status]}`}
                >
                  {order.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
