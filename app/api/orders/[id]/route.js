import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { ORDER_STATUSES, ORDER_TRANSITIONS } from "@/lib/constants";
import { requireUser, requireAdmin } from "@/lib/auth-helpers";
import { isValidObjectId } from "@/lib/object-id";

export async function GET(request, { params }) {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return Response.json({ error: "Invalid order ID" }, { status: 400 });
  }
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
  if (!isValidObjectId(id)) {
    return Response.json({ error: "Invalid order ID" }, { status: 400 });
  }
  const { status } = await request.json();

  if (!ORDER_STATUSES.includes(status)) {
    return Response.json({ error: "Invalid status" }, { status: 400 });
  }

  await connectDB();
  const dbSession = await mongoose.startSession();
  let order;

  try {
    await dbSession.withTransaction(async () => {
      order = await Order.findById(id).session(dbSession);
      if (!order) {
        const error = new Error("Order not found");
        error.status = 404;
        throw error;
      }

      if (order.status === status) return;
      if (!(ORDER_TRANSITIONS[order.status] || []).includes(status)) {
        const error = new Error(`Order cannot move from ${order.status} to ${status}`);
        error.status = 409;
        throw error;
      }

      if (status === "Cancelled" && !order.stockRestored) {
        for (const item of order.items) {
          const stockUpdate = await Product.updateOne(
            { _id: item.product },
            { $inc: { stock: item.qty } },
            { session: dbSession }
          );
          if (stockUpdate.matchedCount !== 1) {
            const error = new Error(`Cannot restore stock for missing product: ${item.name}`);
            error.status = 409;
            throw error;
          }
        }
        order.stockRestored = true;
      }

      order.status = status;
      await order.save({ session: dbSession });
    });
  } catch (error) {
    return Response.json(
      { error: error.status ? error.message : "Unable to update order status" },
      { status: error.status || 500 }
    );
  } finally {
    await dbSession.endSession();
  }

  return Response.json({ order });
}
