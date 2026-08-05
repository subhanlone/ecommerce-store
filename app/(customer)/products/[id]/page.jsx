import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Review from "@/models/Review";
import { auth } from "@/auth";
import AddToCartButton from "@/components/customer/AddToCartButton";
import ReviewForm from "@/components/customer/ReviewForm";
import StarRating from "@/components/ui/StarRating";

export default async function ProductDetailPage({ params }) {
  const { id } = await params;

  const session = await auth();

  await connectDB();
  const product = await Product.findById(id).populate("category", "name slug").lean();

  if (!product) {
    notFound();
  }

  const reviews = await Review.find({ product: id })
    .populate("user", "name")
    .sort({ createdAt: -1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(product));
  const serializedReviews = JSON.parse(JSON.stringify(reviews));
  const existingReview = session
    ? serializedReviews.find((r) => r.user?._id === session.user.id)
    : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="relative aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {serialized.images?.[0] ? (
            <Image
              src={serialized.images[0]}
              alt={serialized.name}
              fill
              className="object-cover"
              sizes="(min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-neutral-400">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {serialized.category?.name && (
            <p className="text-sm text-neutral-500">{serialized.category.name}</p>
          )}
          <h1 className="text-2xl font-semibold">{serialized.name}</h1>
          <StarRating rating={serialized.ratingAvg} count={serialized.ratingCount} size="lg" />
          <p className="text-2xl font-semibold text-accent">
            ${Number(serialized.price).toFixed(2)}
          </p>
          <p className="text-sm leading-relaxed text-neutral-600">{serialized.description}</p>

          {serialized.variants?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              {serialized.variants.map((v, i) => (
                <span key={i} className="rounded-md border border-neutral-300 px-2 py-1">
                  {v.name}: {v.value}
                </span>
              ))}
            </div>
          )}

          <p className="text-sm">
            {serialized.stock > 0 ? (
              <span className="text-green-600">In stock ({serialized.stock} available)</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>

          <AddToCartButton product={serialized} />
        </div>
      </div>

      <div className="mt-12 max-w-2xl">
        <h2 className="mb-4 text-xl font-semibold">
          Reviews {serialized.ratingCount > 0 && `(${serialized.ratingCount})`}
        </h2>

        {session ? (
          <div className="mb-8 rounded-lg border border-neutral-200 p-4">
            <p className="mb-3 text-sm font-medium text-neutral-700">
              {existingReview ? "Update your review" : "Write a review"}
            </p>
            <ReviewForm productId={id} existingReview={existingReview} />
          </div>
        ) : (
          <p className="mb-8 text-sm text-neutral-500">
            <Link href="/login" className="text-accent font-medium">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        )}

        {serializedReviews.length === 0 ? (
          <p className="text-sm text-neutral-500">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {serializedReviews.map((review) => (
              <div key={review._id} className="border-b border-neutral-200 pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{review.user?.name || "Anonymous"}</p>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm text-neutral-600">{review.comment}</p>
                )}
                <p className="mt-1 text-xs text-neutral-400">
                  {new Date(review.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
