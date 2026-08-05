// Usage: node --env-file=.env.local scripts/addProductImages.mjs
//
// Uploads a real, pre-vetted product photo per product (downloaded from
// Wikimedia Commons into the local ./product-images folder) to Cloudinary,
// and saves the resulting secure_url onto the product. Overwrites the
// placeholder images uploaded by the earlier pass (same public_id).
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/Product.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.join(__dirname, "product-images");

const PRODUCT_IMAGES = {
  "Wireless Headphones": "headphones.jpg",
  "Bluetooth Speaker": "speaker.jpg",
  "Smartwatch": "smartwatch.jpg",
  "Cotton T-Shirt": "tshirt2.png",
  "Denim Jacket": "jacket2.jpg",
  "Ceramic Mug Set": "mug.jpg",
  "Non-Stick Pan": "pan.jpg",
  "The Pragmatic Programmer": "pragprog.jpg",
  "Atomic Habits": "atomichabits.jpg",
};

function mimeFor(file) {
  return file.endsWith(".png") ? "image/png" : "image/jpeg";
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "ecommerce-store" });

  const products = await Product.find();

  for (const product of products) {
    const file = PRODUCT_IMAGES[product.name];
    if (!file) {
      console.log(`SKIP (no mapped image): ${product.name}`);
      continue;
    }

    const filePath = path.join(IMAGE_DIR, file);
    const buffer = fs.readFileSync(filePath);
    const dataUri = `data:${mimeFor(file)};base64,${buffer.toString("base64")}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: "ecommerce-store",
      public_id: product._id.toString(),
      overwrite: true,
      invalidate: true,
    });

    product.images = [result.secure_url];
    await product.save();

    console.log(`${product.name} -> ${result.secure_url}`);
  }

  console.log("Done.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
