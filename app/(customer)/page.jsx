import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/customer/ProductCard";
import Reveal from "@/components/ui/Reveal";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();

  const [products, categories] = await Promise.all([
    Product.find().populate("category", "name").sort({ createdAt: -1 }).limit(8).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  const serialized = JSON.parse(JSON.stringify(products));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div>
      {/*
        The hero used to be a flat grey band holding a headline and a button.
        For a store whose actual proposition is breadth — four unrelated
        departments — the most useful thing it can do is get you into a
        department in one click, so the categories are part of the hero rather
        than something to scroll for.
      */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 md:py-24">
          <p className="label-caps text-xs text-accent">Electronics · Clothing · Home · Books</p>

          <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-[1.1] text-text md:text-5xl">
            Everything you need,
            <br />
            all in one store.
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-text-muted">
            Browse the catalogue, save what you like, and check out in minutes with cash on
            delivery.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/products">
              <Button size="lg">Shop all products</Button>
            </Link>
          </div>

          {serializedCategories.length > 0 && (
            <div className="mt-12 border-t border-line pt-6">
              <p className="label-caps mb-3 text-[10px] text-text-subtle">Shop by category</p>
              <div className="flex flex-wrap gap-2">
                {serializedCategories.map((category) => (
                  <Link
                    key={category._id}
                    href={`/products?category=${category._id}`}
                    className="rounded-full border border-line-strong px-4 py-2 text-sm font-medium text-text-muted transition-colors hover:border-accent hover:bg-accent-subtle hover:text-accent"
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {serialized.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-text">New arrivals</h2>
              <p className="mt-1 text-sm text-text-muted">The latest additions to the catalogue.</p>
            </div>
            <Link
              href="/products"
              className="shrink-0 text-sm font-medium text-accent hover:underline"
            >
              View all
            </Link>
          </div>

          <Reveal className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {serialized.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </Reveal>
        </section>
      )}
    </div>
  );
}
