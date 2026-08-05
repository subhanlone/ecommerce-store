import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET() {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  const customers = await User.find({ role: "customer" }).sort({ createdAt: -1 }).lean();
  const orderCounts = await Order.aggregate([
    { $group: { _id: "$user", count: { $sum: 1 } } },
  ]);
  const countMap = new Map(orderCounts.map((o) => [o._id.toString(), o.count]));

  const customersWithCounts = customers.map((c) => ({
    ...c,
    orderCount: countMap.get(c._id.toString()) || 0,
  }));

  return Response.json({ customers: customersWithCounts });
}
