import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import DashboardCard from "@/components/admin/DashboardCard";

const STATUS_COLORS = {
  Pending: "bg-neutral-400",
  Processing: "bg-blue-500",
  Shipped: "bg-amber-500",
  Delivered: "bg-green-500",
  Cancelled: "bg-red-500",
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
  const maxCount = Math.max(1, ...Object.values(statusMap));

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <DashboardCard label="Total Sales" value={`$${totalSales.toFixed(2)}`} />
        <DashboardCard label="Total Orders" value={totalOrders} />
        <DashboardCard label="Total Products" value={totalProducts} />
        <DashboardCard label="Total Customers" value={totalCustomers} />
      </div>

      <div className="mt-8 rounded-lg border border-neutral-200 bg-white p-5">
        <h2 className="mb-4 text-sm font-semibold text-neutral-700">Orders by Status</h2>
        <div className="flex flex-col gap-3">
          {Object.entries(STATUS_COLORS).map(([status, color]) => {
            const count = statusMap[status] || 0;
            return (
              <div key={status} className="flex items-center gap-3">
                <span className="w-24 text-sm text-neutral-600">{status}</span>
                <div className="h-3 flex-1 overflow-hidden rounded-full bg-neutral-100">
                  <div
                    className={`h-full ${color}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
                <span className="w-8 text-right text-sm text-neutral-600">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
