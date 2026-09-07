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
import { formatDate, formatPrice } from "@/lib/utils";

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
        <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-muted">
          {serialized.images?.[0] ? (
            <Image
              src={serialized.images[0]}
              alt={serialized.name}
              fill
              preload
              className="object-cover"
              sizes="(min-width: 1152px) 560px, (min-width: 768px) 50vw, 100vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-text-subtle">
              No image
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {serialized.category?.name && (
            /* Same small-caps treatment the product cards use, so the category
               reads as a label in both places rather than as body copy here. */
            <Link
              href={`/products?category=${serialized.category._id}`}
              className="label-caps text-[10px] text-text-subtle transition-colors hover:text-accent"
            >
              {serialized.category.name}
            </Link>
          )}
          <h1 className="text-3xl font-semibold text-text">{serialized.name}</h1>
          <StarRating rating={serialized.ratingAvg} count={serialized.ratingCount} size="lg" />
          <p className="tabular text-2xl font-semibold text-accent">
            {formatPrice(serialized.price)}
          </p>
          <p className="text-sm leading-relaxed text-text-muted">{serialized.description}</p>

          {serialized.variants?.length > 0 && (
            <div className="flex flex-wrap gap-2 text-sm">
              {serialized.variants.map((v, i) => (
                <span key={i} className="rounded-full border border-line-strong px-3 py-1 text-text-muted">
                  {v.name}: {v.value}
                </span>
              ))}
            </div>
          )}

          {/*
            Stock reads as plain text rather than accent green. The accent is
            already carrying the price directly above; two accent-coloured lines
            stacked together compete, and neither wins. Low stock is the only
            case that genuinely needs to raise a flag.
          */}
          <p className="text-sm font-medium">
            {serialized.stock === 0 ? (
              <span className="text-danger">Out of stock</span>
            ) : serialized.stock <= 5 ? (
              <span className="text-danger">Only {serialized.stock} left in stock</span>
            ) : (
              <span className="text-text-muted">In stock ({serialized.stock} available)</span>
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
          <div className="mb-8 rounded-lg border border-line p-4">
            <p className="mb-3 text-sm font-medium text-text-muted">
              {existingReview ? "Update your review" : "Write a review"}
            </p>
            <ReviewForm productId={id} existingReview={existingReview} />
          </div>
        ) : (
          <p className="mb-8 text-sm text-text-subtle">
            <Link href="/login" className="text-accent font-medium">
              Log in
            </Link>{" "}
            to leave a review.
          </p>
        )}

        {serializedReviews.length === 0 ? (
          <p className="text-sm text-text-subtle">No reviews yet.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {serializedReviews.map((review) => (
              <div key={review._id} className="border-b border-line pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{review.user?.name || "Anonymous"}</p>
                  <StarRating rating={review.rating} />
                </div>
                {review.comment && (
                  <p className="mt-1 text-sm text-text-muted">{review.comment}</p>
                )}
                <p className="mt-1 text-xs text-text-subtle">
                  {formatDate(review.createdAt)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
