import Link from "next/link";
import Image from "next/image";
import StarRating from "@/components/ui/StarRating";

const LOW_STOCK_THRESHOLD = 5;

export default function ProductCard({ product }) {
  const image = product.images?.[0];
  const outOfStock = product.stock === 0;
  const lowStock = !outOfStock && product.stock <= LOW_STOCK_THRESHOLD;

  return (
    <Link
      href={`/products/${product._id}`}
      className="group flex flex-col overflow-hidden rounded-xl border border-line bg-surface transition-all duration-200 hover:border-line-strong hover:shadow-[0_2px_12px_rgba(28,25,23,0.08)]"
    >
      <div className="relative aspect-square overflow-hidden bg-surface-muted">
        {image ? (
          <Image
            src={image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.04]"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-text-subtle">
            No image
          </div>
        )}

        {/*
          Stock is the one thing that changes whether the card is actionable at
          all, so it sits on the image rather than below the fold of the card.
          Out of stock also desaturates the image — the state should be legible
          before you read a word.
        */}
        {outOfStock && (
          <>
            <div className="absolute inset-0 bg-surface/60" />
            <span className="label-caps absolute left-3 top-3 rounded-full bg-text px-2.5 py-1 text-[10px] text-surface">
              Sold out
            </span>
          </>
        )}
        {lowStock && (
          <span className="label-caps absolute left-3 top-3 rounded-full bg-surface px-2.5 py-1 text-[10px] text-danger shadow-sm">
            Only {product.stock} left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        {product.category?.name && (
          <p className="label-caps text-[10px] text-text-subtle">{product.category.name}</p>
        )}

        <p className="line-clamp-2 text-sm font-medium leading-snug text-text group-hover:text-accent">
          {product.name}
        </p>

        <StarRating rating={product.ratingAvg} count={product.ratingCount} />

        {/*
          Price stays in the accent because the brief asks for the accent to
          highlight product cards specifically. It only became a legitimate
          choice once the accent moved to emerald-700 — at the old emerald-600
          this was 3.77:1 text, under the AA floor.

          mt-auto pins it to the bottom so prices align across a row of cards
          whose names wrap to different line counts.
        */}
        <p className="tabular mt-auto pt-2 text-base font-semibold text-accent">
          ${Number(product.price).toFixed(2)}
        </p>
      </div>
    </Link>
  );
}
