import Link from "next/link";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import ProductTable from "@/components/admin/ProductTable";
import Button from "@/components/ui/Button";

export default async function AdminProductsPage() {
  await connectDB();
  const products = await Product.find().populate("category", "name").sort({ createdAt: -1 }).lean();
  const serialized = JSON.parse(JSON.stringify(products));

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Products</h1>
        <Link href="/admin/products/add">
          <Button>Add Product</Button>
        </Link>
      </div>
      <ProductTable products={serialized} />
    </div>
  );
}
