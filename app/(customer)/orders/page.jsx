import Link from "next/link";
import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { auth } from "@/auth";
import Button from "@/components/ui/Button";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate, formatPrice } from "@/lib/utils";

export default async function OrderHistoryPage() {
  const session = await auth();

  await connectDB();
  const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-semibold text-text">Your orders</h1>

      {orders.length === 0 ? (
        /* An empty screen is somewhere to go next, not a dead end. */
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <p className="font-medium text-text">No orders yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            Once you place an order it will appear here, with its current status.
          </p>
          <Link href="/products" className="mt-5 inline-block">
            <Button>Browse products</Button>
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {orders.map((order) => (
            <Link
              key={order._id}
              href={`/orders/${order._id}`}
              className="flex items-center justify-between gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong"
            >
              <div className="min-w-0">
                <p className="font-medium text-text">
                  Order #{order._id.toString().slice(-8)}
                </p>
                <p className="mt-0.5 text-sm text-text-muted">
                  {formatDate(order.createdAt)} &middot; {order.items.length}{" "}
                  item{order.items.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4">
                <span className="tabular font-semibold text-text">
                  {formatPrice(order.totalAmount)}
                </span>
                <StatusBadge status={order.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
