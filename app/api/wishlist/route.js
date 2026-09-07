import { connectDB } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { requireUser } from "@/lib/auth-helpers";
import { wishlistStateSchema } from "@/lib/validation";

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

  const parsed = wishlistStateSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid wishlist" },
      { status: 400 }
    );
  }
  const productIds = [...new Set(parsed.data.items.map((item) => item.productId))];

  await connectDB();

  const validIds = new Set(
    (await Product.find({ _id: { $in: productIds } }, "_id"))
      .map((p) => p._id.toString())
  );

  if (validIds.size !== productIds.length) {
    return Response.json({ error: "One or more products no longer exist" }, { status: 409 });
  }

  const wishlistItems = productIds.map((productId) => ({ product: productId }));

  await Wishlist.findOneAndUpdate(
    { user: session.user.id },
    { items: wishlistItems },
    { upsert: true, new: true, runValidators: true }
  );

  return Response.json({ success: true });
}
