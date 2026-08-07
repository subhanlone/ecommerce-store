import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { requireUser } from "@/lib/auth-helpers";

export async function GET() {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();
  const wishlist = await Wishlist.findOne({ user: session.user.id }).populate(
    "items.product",
    "name price images"
  );

  const items = (wishlist?.items || [])
    .filter((i) => i.product)
    .map((i) => ({
      productId: i.product._id.toString(),
      name: i.product.name,
      price: i.product.price,
      image: i.product.images?.[0] || null,
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

  const wishlistItems = items
    .filter((i) => validIds.has(i.productId))
    .map((i) => ({ product: i.productId }));

  await Wishlist.findOneAndUpdate(
    { user: session.user.id },
    { items: wishlistItems },
    { upsert: true, new: true }
  );

  return Response.json({ success: true });
}
