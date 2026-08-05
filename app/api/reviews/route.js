import { connectDB } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import { reviewSchema } from "@/lib/validation";
import { requireUser } from "@/lib/auth-helpers";

async function recomputeProductRating(productId) {
  const stats = await Review.aggregate([
    { $match: { product: productId } },
    { $group: { _id: "$product", avg: { $avg: "$rating" }, count: { $sum: 1 } } },
  ]);

  const { avg = 0, count = 0 } = stats[0] || {};
  await Product.findByIdAndUpdate(productId, {
    ratingAvg: Math.round(avg * 10) / 10,
    ratingCount: count,
  });
}

export async function POST(request) {
  const session = await requireUser();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();

  const product = await Product.findById(parsed.data.product);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  await Review.findOneAndUpdate(
    { product: parsed.data.product, user: session.user.id },
    { rating: parsed.data.rating, comment: parsed.data.comment },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  await recomputeProductRating(product._id);

  return Response.json({ success: true }, { status: 201 });
}
