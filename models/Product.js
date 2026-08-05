import mongoose from "mongoose";

const VariantSchema = new mongoose.Schema(
  {
    name: String,
    value: String,
  },
  { _id: false }
);

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    images: { type: [String], default: [] },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    variants: { type: [VariantSchema], default: [] },
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text" });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
