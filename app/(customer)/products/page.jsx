import { Suspense } from "react";
import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductCard from "@/components/customer/ProductCard";
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
        <h1 className="text-2xl font-semibold">
          {q ? `Search results for "${q}"` : "All Products"}
        </h1>
        <Suspense>
          <ProductFilters categories={serializedCategories} />
        </Suspense>
      </div>

      {serializedProducts.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">No products found.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {serializedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
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
                className={`rounded-md px-3 py-1.5 ${
                  p === page ? "bg-accent text-accent-foreground" : "border border-neutral-300"
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
