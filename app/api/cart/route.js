import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const cart = await Cart.findOne({ user: session.user.id }).populate(
    "items.product",
    "name price images stock"
  );

  const items = (cart?.items || [])
    .filter((i) => i.product)
    .map((i) => ({
      productId: i.product._id.toString(),
      name: i.product.name,
      price: i.product.price,
      image: i.product.images?.[0] || null,
      stock: i.product.stock,
      qty: i.qty,
    }));

  return Response.json({ items });
}

export async function PUT(request) {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { items } = await request.json();
  if (!Array.isArray(items)) {
    return Response.json({ error: "items must be an array" }, { status: 400 });
  }

  await connectDB();

  const validIds = new Set(
    (await Product.find({ _id: { $in: items.map((i) => i.productId) } }, "_id"))
      .map((p) => p._id.toString())
  );

  const cartItems = items
    .filter((i) => validIds.has(i.productId))
    .map((i) => ({ product: i.productId, qty: Math.max(1, i.qty) }));

  await Cart.findOneAndUpdate(
    { user: session.user.id },
    { items: cartItems },
    { upsert: true, new: true }
  );

  return Response.json({ success: true });
}
