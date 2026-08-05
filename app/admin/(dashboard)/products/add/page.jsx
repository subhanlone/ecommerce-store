import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import ProductForm from "@/components/admin/ProductForm";

export default async function AddProductPage() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  const serialized = JSON.parse(JSON.stringify(categories));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Add Product</h1>
      {serialized.length === 0 ? (
        <p className="text-sm text-neutral-500">
          Create a category first before adding products.
        </p>
      ) : (
        <ProductForm categories={serialized} />
      )}
    </div>
  );
}
