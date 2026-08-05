import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Button from "@/components/ui/Button";
import ProductCard from "@/components/customer/ProductCard";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await connectDB();
  const products = await Product.find()
    .populate("category", "name")
    .sort({ createdAt: -1 })
    .limit(8)
    .lean();
  const serialized = JSON.parse(JSON.stringify(products));

  return (
    <div>
      <section className="bg-neutral-100">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-24">
          <h1 className="text-4xl font-semibold tracking-tight">
            Everything you need, all in one store.
          </h1>
          <p className="max-w-xl text-neutral-600">
            Browse our catalog, add your favorites to the cart, and check out in minutes.
          </p>
          <Link href="/products">
            <Button>Shop now</Button>
          </Link>
        </div>
      </section>

      {serialized.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold">New Arrivals</h2>
            <Link href="/products" className="text-sm font-medium text-accent hover:underline">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {serialized.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
