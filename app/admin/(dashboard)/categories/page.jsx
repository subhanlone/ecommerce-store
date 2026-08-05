import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  const serialized = JSON.parse(JSON.stringify(categories));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Categories</h1>
      <CategoryManager categories={serialized} />
    </div>
  );
}
