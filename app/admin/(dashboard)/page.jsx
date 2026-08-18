import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import DashboardCard from "@/components/admin/DashboardCard";

import { ORDER_STATUSES } from "@/lib/constants";

/* Same hues as the status badges, from the same tokens, so a status means one
   colour whether you meet it here or in the orders table. */
const STATUS_SOLID = {
  Pending: "--status-pending-solid",
  Processing: "--status-processing-solid",
  Shipped: "--status-shipped-solid",
  Delivered: "--status-delivered-solid",
  Cancelled: "--status-cancelled-solid",
};

export default async function AdminDashboardPage() {
  await connectDB();

  const [totalOrders, totalProducts, totalCustomers, orders, statusCounts] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments(),
    User.countDocuments({ role: "customer" }),
    Order.find().select("totalAmount").lean(),
    Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
  ]);

  const totalSales = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const statusMap = Object.fromEntries(statusCounts.map((s) => [s._id, s.count]));

  /*
    Bars are a share of all orders, not a share of the largest single status.
    Scaling to the maximum meant that with one Pending and one Shipped order
    both bars filled completely, which reads as "everything is at capacity"
    rather than "half and half".
  */
  const barBasis = Math.max(1, totalOrders);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-text">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard label="Total Sales" value={`$${totalSales.toFixed(2)}`} />
        <DashboardCard label="Total Orders" value={totalOrders} />
        <DashboardCard label="Total Products" value={totalProducts} />
        <DashboardCard label="Total Customers" value={totalCustomers} />
      </div>

      <div className="mt-8 rounded-xl border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold text-text">Orders by status</h2>
        <div className="flex flex-col gap-3">
          {ORDER_STATUSES.map((status) => {
            const count = statusMap[status] || 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 shrink-0 text-sm text-text-muted">{status}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div
                    className="h-full rounded-full transition-[width] duration-500"
                    style={{
                      width: `${(count / barBasis) * 100}%`,
                      backgroundColor: `var(${STATUS_SOLID[status]})`,
                    }}
                  />
                </div>
                <span className="tabular w-8 shrink-0 text-right text-sm font-medium text-text">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
