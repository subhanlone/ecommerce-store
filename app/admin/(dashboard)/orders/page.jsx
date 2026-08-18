import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import OrderTable from "@/components/admin/OrderTable";
import { ORDER_STATUSES } from "@/lib/constants";

export default async function AdminOrdersPage({ searchParams }) {
  const params = await searchParams;
  const status = params.status || "";
  const q = (params.q || "").toLowerCase();
  const date = params.date || "";

  await connectDB();

  const filter = {};
  if (status) filter.status = status;
  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    filter.createdAt = { $gte: start, $lt: end };
  }

  let orders = await Order.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .lean();

  if (q) {
    orders = orders.filter(
      (o) =>
        o.user?.name?.toLowerCase().includes(q) || o.user?.email?.toLowerCase().includes(q)
    );
  }

  const serialized = JSON.parse(JSON.stringify(orders));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold text-text">Orders</h1>

      <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
        <div className="flex flex-col gap-1">
          <label htmlFor="status" className="text-xs font-medium text-text-muted">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-sm text-text"
          >
            <option value="">All</option>
            {ORDER_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-xs font-medium text-text-muted">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            defaultValue={date}
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-sm text-text"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="q" className="text-xs font-medium text-text-muted">Customer</label>
          <input
            id="q"
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Name or email"
            className="h-10 rounded-lg border border-line-strong bg-surface px-3 text-sm text-text"
          />
        </div>
        <button type="submit" className="h-10 rounded-lg bg-accent px-5 font-medium text-accent-foreground transition-colors hover:bg-accent-hover">
          Filter
        </button>
      </form>

      {serialized.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-14 text-center">
          <p className="font-medium text-text">No orders found</p>
          <p className="mt-1 text-sm text-text-muted">No orders match these filters yet.</p>
        </div>
      ) : (
        <OrderTable orders={serialized} />
      )}
    </div>
  );
}
