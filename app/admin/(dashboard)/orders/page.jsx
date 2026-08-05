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
      <h1 className="mb-6 text-2xl font-semibold">Orders</h1>

      <form className="mb-4 flex flex-wrap items-end gap-3 text-sm" method="get">
        <div className="flex flex-col gap-1">
          <label htmlFor="status">Status</label>
          <select
            id="status"
            name="status"
            defaultValue={status}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
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
          <label htmlFor="date">Date</label>
          <input
            id="date"
            type="date"
            name="date"
            defaultValue={date}
            className="rounded-md border border-neutral-300 px-2 py-1.5"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="q">Customer</label>
          <input
            id="q"
            type="text"
            name="q"
            defaultValue={params.q || ""}
            placeholder="Name or email"
            className="rounded-md border border-neutral-300 px-2 py-1.5"
          />
        </div>
        <button type="submit" className="rounded-md bg-accent px-4 py-1.5 text-accent-foreground">
          Filter
        </button>
      </form>

      {serialized.length === 0 ? (
        <p className="text-neutral-500">No orders found.</p>
      ) : (
        <OrderTable orders={serialized} />
      )}
    </div>
  );
}
