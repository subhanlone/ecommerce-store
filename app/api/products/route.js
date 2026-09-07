import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { productSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";
import { isValidObjectId } from "@/lib/object-id";

const SORT_MAP = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  newest: { createdAt: -1 },
};

const PAGE_SIZE = 12;

export async function GET(request) {
  await connectDB();

  const { searchParams } = new URL(request.url);
  const requestedPage = Number.parseInt(searchParams.get("page") || "1", 10);
  const page = Number.isFinite(requestedPage) ? Math.max(1, requestedPage) : 1;
  const category = searchParams.get("category");
  const q = searchParams.get("q");
  const sort = SORT_MAP[searchParams.get("sort")] || SORT_MAP.newest;

  const filter = {};
  if (category && !isValidObjectId(category)) {
    return Response.json({ error: "Invalid category ID" }, { status: 400 });
  }
  if (category) filter.category = category;
  if (q) filter.$text = { $search: q };

  const [products, total] = await Promise.all([
    Product.find(filter)
      .populate("category", "name slug")
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Product.countDocuments(filter),
  ]);

  return Response.json({
    products,
    pagination: {
      page,
      pageSize: PAGE_SIZE,
      total,
      totalPages: Math.ceil(total / PAGE_SIZE) || 1,
    },
  });
}

export async function POST(request) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  if (!(await Category.exists({ _id: parsed.data.category }))) {
    return Response.json({ error: "Category not found" }, { status: 400 });
  }
  const product = await Product.create(parsed.data);
  return Response.json({ product }, { status: 201 });
}
