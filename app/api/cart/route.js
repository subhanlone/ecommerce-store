import { connectDB } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { requireUser } from "@/lib/auth-helpers";
import { cartStateSchema } from "@/lib/validation";

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

  const parsed = cartStateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid cart" },
      { status: 400 }
    );
  }
  const deduplicatedItems = [...new Map(
    parsed.data.items.map((item) => [item.productId, item])
  ).values()];

  await connectDB();

  const products = await Product.find(
    { _id: { $in: deduplicatedItems.map((item) => item.productId) } },
    "_id stock name"
  ).lean();
  const productMap = new Map(products.map((product) => [product._id.toString(), product]));

  if (products.length !== deduplicatedItems.length) {
    return Response.json({ error: "One or more products no longer exist" }, { status: 409 });
  }
  const unavailable = deduplicatedItems.find((item) => item.qty > productMap.get(item.productId).stock);
  if (unavailable) {
    return Response.json(
      { error: `${productMap.get(unavailable.productId).name} does not have enough stock` },
      { status: 409 }
    );
  }

  const cartItems = deduplicatedItems.map((item) => ({
    product: item.productId,
    qty: item.qty,
  }));

  await Cart.findOneAndUpdate(
    { user: session.user.id },
    { items: cartItems },
    { upsert: true, new: true, runValidators: true }
  );

  return Response.json({ success: true });
}
