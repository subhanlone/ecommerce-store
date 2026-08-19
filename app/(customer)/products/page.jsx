import { Suspense } from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/customer/ProductCard";
import Reveal from "@/components/ui/Reveal";
import ProductFilters from "@/components/customer/ProductFilters";

const PAGE_SIZE = 12;
const SORT_MAP = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
};

export default async function ProductsPage({ searchParams }) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const category = params.category || "";
  const q = params.q || "";
  const sort = SORT_MAP[params.sort] || SORT_MAP.newest;

  await connectDB();

  const filter = {};
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const [products, total, categories] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(filter),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  const totalPages = Math.ceil(total / PAGE_SIZE) || 1;
  const serializedProducts = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-text">
            {q ? `Search results for "${q}"` : "All products"}
          </h1>
          {/* Result count, so the filters visibly do something. */}
          <p className="mt-1 text-sm text-text-muted">
            {total} product{total === 1 ? "" : "s"}
          </p>
        </div>
        <Suspense>
          <ProductFilters categories={serializedCategories} />
        </Suspense>
      </div>

      {serializedProducts.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line-strong bg-surface px-6 py-16 text-center">
          <p className="font-medium text-text">No products found</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-text-muted">
            {q
              ? `Nothing matched "${q}". Try a different search, or clear the filters.`
              : "Nothing matches these filters yet. Try a different category."}
          </p>
          <Link
            href="/products"
            className="mt-5 inline-block text-sm font-medium text-accent hover:underline"
          >
            Clear filters
          </Link>
        </div>
      ) : (
        <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {serializedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </Reveal>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2 text-sm">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const searchParamsCopy = new URLSearchParams({
              ...(category && { category }),
              ...(q && { q }),
              ...(params.sort && { sort: params.sort }),
              page: String(p),
            });
            return (
              <Link
                key={p}
                href={`/products?${searchParamsCopy.toString()}`}
                aria-current={p === page ? "page" : undefined}
                aria-label={`Page ${p}`}
                className={`flex h-10 min-w-10 items-center justify-center rounded-lg px-3 font-medium transition-colors ${
                  p === page
                    ? "bg-accent text-accent-foreground"
                    : "border border-line-strong text-text-muted hover:border-accent hover:text-accent"
                }`}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
