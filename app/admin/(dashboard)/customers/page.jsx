import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

export default async function AdminCustomersPage() {
  await connectDB();

  const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
  const orderCounts = await Order.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(orderCounts.map((o) => [o._id.toString(), o.count]));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Customers</h1>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full min-w-[480px] border-collapse bg-surface text-sm">
          <thead className="bg-surface-sunken text-left text-text-muted">
            <tr>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Email</th>
              <th className="px-4 py-2">Joined</th>
              <th className="px-4 py-2">Orders</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer._id} className="border-t border-line">
                <td className="px-4 py-2">{customer.name}</td>
                <td className="px-4 py-2">{customer.email}</td>
                <td className="px-4 py-2">{new Date(customer.createdAt).toLocaleDateString()}</td>
                <td className="px-4 py-2">{countMap.get(customer._id.toString()) || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {customers.length === 0 && <p className="mt-4 text-text-subtle">No customers yet.</p>}
    </div>
  );
}
