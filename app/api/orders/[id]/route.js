import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import { ORDER_STATUSES } from "@/lib/constants";
import { requireUser, requireAdmin } from "@/lib/auth-helpers";

export async function GET(request, { params }) {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  const order = await Order.findById(id).populate("user", "name email").lean();

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  const isOwner = order.user?._id?.toString() === session.user.id;
  if (!isOwner && session.user.role !== "admin") {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  return Response.json({ order });
}

export async function PUT(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  if (!ORDER_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const order = await Order.findByIdAndUpdate(id, { status }, { new: true });

  if (!order) {
    return Response.json({ error: "Order not found" }, { status: 404 });
  }

  return Response.json({ order });
}
