import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import mongoose from "mongoose";
import { shippingAddressSchema } from "@/lib/validation";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const orders = await Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
  return Response.json({ orders });
}

export async function POST(request) {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = shippingAddressSchema.safeParse(body.shippingAddress);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid shipping address" },
      { status: 400 }
    );
  }

  await connectDB();

  const dbSession = await mongoose.startSession();
  let order;

  try {
    await dbSession.withTransaction(async () => {
      const cart = await Cart.findOne({ user: session.user.id }).session(dbSession);
      if (!cart || cart.items.length === 0) {
        const error = new Error("Cart is empty");
        error.status = 400;
        throw error;
      }

      const productIds = cart.items.map((item) => item.product);
      const products = await Product.find({ _id: { $in: productIds } }).session(dbSession);
      const productMap = new Map(products.map((product) => [product._id.toString(), product]));
      const orderItems = [];

      for (const item of cart.items) {
        const product = productMap.get(item.product.toString());
        if (!product) {
          const error = new Error("A cart product no longer exists");
          error.status = 409;
          throw error;
        }

        const stockUpdate = await Product.updateOne(
          { _id: product._id, stock: { $gte: item.qty } },
          { $inc: { stock: -item.qty } },
          { session: dbSession }
        );
        if (stockUpdate.modifiedCount !== 1) {
          const error = new Error(`${product.name} does not have enough stock`);
          error.status = 409;
          throw error;
        }

        orderItems.push({
          product: product._id,
          name: product.name,
          qty: item.qty,
          price: product.price,
        });
      }

      const totalAmount = orderItems.reduce((sum, item) => sum + item.price * item.qty, 0);
      [order] = await Order.create([{
        user: session.user.id,
        items: orderItems,
        totalAmount,
        shippingAddress: parsed.data,
        paymentMethod: "COD",
      }], { session: dbSession });

      await Cart.updateOne({ _id: cart._id }, { $set: { items: [] } }, { session: dbSession });
    });
  } catch (error) {
    return Response.json(
      { error: error.status ? error.message : "Unable to place order" },
      { status: error.status || 500 }
    );
  } finally {
    await dbSession.endSession();
  }

  return Response.json({ order }, { status: 201 });
}
