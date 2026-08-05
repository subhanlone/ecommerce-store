import { notFound } from "next/navigation";
import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import ProductForm from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }) {
  const { id } = await params;

  await connectDB();
  const [product, categories] = await Promise.all([
    Product.findById(id).lean(),
    Category.find().sort({ name: 1 }).lean(),
  ]);

  if (!product) {
    notFound();
  }

  const serializedProduct = JSON.parse(JSON.stringify(product));
  const serializedCategories = JSON.parse(JSON.stringify(categories));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit Product</h1>
      <ProductForm
        categories={serializedCategories}
        productId={id}
        initialData={{
          name: serializedProduct.name,
          description: serializedProduct.description,
          price: serializedProduct.price,
          category: serializedProduct.category,
          stock: serializedProduct.stock,
          images: serializedProduct.images || [],
          variants: serializedProduct.variants || [],
        }}
      />
    </div>
  );
}
