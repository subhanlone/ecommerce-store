import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categorySchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";
import { slugify } from "@/lib/utils";

export async function GET() {
  await connectDB();
  const categories = await Category.find().sort({ name: 1 }).lean();
  return Response.json({ categories });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const existing = await Category.findOne({ slug });
  if (existing) {
    return Response.json({ error: "Category already exists" }, { status: 409 });
  }

  const category = await Category.create({ name: parsed.data.name, slug });
  return Response.json({ category }, { status: 201 });
}
