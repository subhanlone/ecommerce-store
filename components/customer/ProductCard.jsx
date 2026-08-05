import Link from "next/link";
import Image from "next/image";
import StarRating from "@/components/ui/StarRating";

export default function ProductCard({ product }) {
  const image = product.images?.[0];

  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition-shadow hover:shadow-md"
    >
      <div className="relative aspect-square bg-neutral-100">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform group-hover:scale-105"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-neutral-400">
            No image
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-1 text-sm font-medium text-neutral-900">{product.name}</p>
        {product.category?.name && (
          <p className="text-xs text-neutral-500">{product.category.name}</p>
        )}
        <StarRating rating={product.ratingAvg} count={product.ratingCount} />
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="font-semibold text-accent">
            ${Number(product.price).toFixed(2)}
          </span>
          {product.stock === 0 && (
            <span className="text-xs font-medium text-red-600">Out of stock</span>
          )}
        </div>
      </div>
    </Link>
  );
}
