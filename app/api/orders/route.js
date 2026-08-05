import { connectDB } from "@/lib/db";
import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
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

  const cart = await Cart.findOne({ user: session.user.id }).populate("items.product");
  if (!cart || cart.items.length === 0) {
    return Response.json({ error: "Cart is empty" }, { status: 400 });
  }

  for (const item of cart.items) {
    if (!item.product || item.product.stock < item.qty) {
      return Response.json(
        { error: `${item.product?.name ?? "A product"} does not have enough stock` },
        { status: 409 }
      );
    }
  }

  const orderItems = cart.items.map((item) => ({
    product: item.product._id,
    name: item.product.name,
    qty: item.qty,
    price: item.product.price,
  }));

  const totalAmount = orderItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const order = await Order.create({
    user: session.user.id,
    items: orderItems,
    totalAmount,
    shippingAddress: parsed.data,
    paymentMethod: "COD",
  });

  await Promise.all(
    cart.items.map((item) =>
      Product.updateOne({ _id: item.product._id }, { $inc: { stock: -item.qty } })
    )
  );

  cart.items = [];
  await cart.save();

  return Response.json({ order }, { status: 201 });
}
