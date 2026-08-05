import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import { productSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(request, { params }) {
  const { id } = await params;
  await connectDB();
  const product = await Product.findById(id).populate("category", "name slug").lean();

  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({ product });
}

export async function PUT(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  const product = await Product.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  return Response.json({ product });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await connectDB();
  await Product.findByIdAndDelete(id);
  return Response.json({ success: true });
}
