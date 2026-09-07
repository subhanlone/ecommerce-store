import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Order from "@/models/Order";
import Review from "@/models/Review";
import Cart from "@/models/Cart";
import Wishlist from "@/models/Wishlist";
import mongoose from "mongoose";
import { productSchema } from "@/lib/validation";
import { requireAdmin } from "@/lib/auth-helpers";
import { isValidObjectId } from "@/lib/object-id";
import { destroyCloudinaryImages } from "@/lib/cloudinary-assets";

export async function GET(request, { params }) {
  const { id } = await params;
  if (!isValidObjectId(id)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }
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
  if (!isValidObjectId(id)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }
  const body = await request.json();
  const parsed = productSchema.partial().safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  await connectDB();
  if (parsed.data.category && !(await Category.exists({ _id: parsed.data.category }))) {
    return Response.json({ error: "Category not found" }, { status: 400 });
  }

  const previous = await Product.findById(id);
  if (!previous) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }

  const previousImages = previous.images || [];
  Object.assign(previous, parsed.data);
  await previous.save();

  const currentImages = new Set(previous.images || []);
  const removedImages = previousImages.filter((url) => !currentImages.has(url));
  const unusedImages = [];
  for (const url of removedImages) {
    if (!(await Product.exists({ _id: { $ne: id }, images: url }))) unusedImages.push(url);
  }
  const cleanupFailures = await destroyCloudinaryImages(unusedImages);

  return Response.json({
    product: previous,
    ...(cleanupFailures.length ? { warning: "Product saved, but some removed images could not be deleted" } : {}),
  });
}

export async function DELETE(request, { params }) {
  const session = await requireAdmin();
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  if (!isValidObjectId(id)) {
    return Response.json({ error: "Invalid product ID" }, { status: 400 });
  }
  await connectDB();
  const product = await Product.findById(id);
  if (!product) {
    return Response.json({ error: "Product not found" }, { status: 404 });
  }
  const dbSession = await mongoose.startSession();
  try {
    await dbSession.withTransaction(async () => {
      if (await Order.exists({ "items.product": id }).session(dbSession)) {
        const error = new Error("Product cannot be deleted because it is referenced by an order");
        error.status = 409;
        throw error;
      }
      await Review.deleteMany({ product: id }, { session: dbSession });
      await Cart.updateMany({}, { $pull: { items: { product: id } } }, { session: dbSession });
      await Wishlist.updateMany({}, { $pull: { items: { product: id } } }, { session: dbSession });
      const deletion = await Product.deleteOne({ _id: id }, { session: dbSession });
      if (deletion.deletedCount !== 1) {
        const error = new Error("Product changed before it could be deleted");
        error.status = 409;
        throw error;
      }
    });
  } catch (error) {
    return Response.json(
      { error: error.status ? error.message : "Unable to delete product" },
      { status: error.status || 500 }
    );
  } finally {
    await dbSession.endSession();
  }

  const unusedImages = [];
  for (const url of product.images || []) {
    if (!(await Product.exists({ images: url }))) unusedImages.push(url);
  }
  const cleanupFailures = await destroyCloudinaryImages(unusedImages);

  return Response.json({
    success: true,
    ...(cleanupFailures.length ? { warning: "Product deleted, but some images could not be deleted" } : {}),
  });
}
