import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function PUT(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const slug = slugify(parsed.data.name);

  const existing = await Category.findOne({ slug, _id: { $ne: id } });
  if (existing) {
    return Response.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await Category.findByIdAndUpdate(
    id,
    { name: parsed.data.name, slug },
    { new: true }
  );

  if (!category) {
    return Response.json({ error: "Category not found" }, { status: 404 });
  }

  return Response.json({ category });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  await Category.findByIdAndDelete(id);
  return Response.json({ success: true });
}
