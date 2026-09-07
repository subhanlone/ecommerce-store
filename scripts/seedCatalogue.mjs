// Usage: node --env-file=.env.local scripts/seedCatalogue.mjs [--dry-run]
//
// Builds the full store catalogue from scripts/catalogue.json:
//   1. upserts the ten categories
//   2. uploads each product's local image to Cloudinary
//   3. upserts the product with its PKR price, stock and description
//
// Idempotent: re-running updates in place rather than duplicating, and an
// image is only re-uploaded when the local file has changed. Safe to run
// repeatedly while filling in images a few at a time.
//
// Unlike scripts/seed.mjs this never calls deleteMany — it will not wipe a
// populated catalogue or orphan the product references held by existing
// orders, carts and wishlists.
//
// Put product photos in scripts/product-images/ named by the slug printed by
// this script, e.g. pressure-cooker-5l.jpg. Products with no image file are
// reported and skipped, so you can seed in batches.
import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import cloudinary from "../lib/cloudinary.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGE_DIR = path.join(__dirname, "product-images");
const CATALOGUE = path.join(__dirname, "catalogue.json");
const MANIFEST = path.join(IMAGE_DIR, ".uploaded.json");
const EXTS = [".jpg", ".jpeg", ".png", ".webp"];

const DRY = process.argv.includes("--dry-run");

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function findImage(slug) {
  for (const ext of EXTS) {
    const p = path.join(IMAGE_DIR, slug + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function mimeFor(file) {
  const ext = path.extname(file).toLowerCase();
  if (ext === ".png") return "image/png";
  if (ext === ".webp") return "image/webp";
  return "image/jpeg";
}

async function main() {
  const catalogue = JSON.parse(fs.readFileSync(CATALOGUE, "utf8"));
  const manifest = fs.existsSync(MANIFEST)
    ? JSON.parse(fs.readFileSync(MANIFEST, "utf8"))
    : {};

  /* MONGODB_DB exists so this can be rehearsed against a throwaway database
     before it touches the real catalogue. It defaults to the app's database,
     which lib/db.js also names explicitly — the URI carries no database path,
     so omitting it would silently land in Mongoose's default `test`. */
  const dbName = process.env.MONGODB_DB || "ecommerce-store";
  await mongoose.connect(process.env.MONGODB_URI, { dbName });
  if (mongoose.connection.name !== dbName) {
    throw new Error(`refusing to seed '${mongoose.connection.name}'`);
  }
  console.log("DB:", mongoose.connection.name, DRY ? "(DRY RUN — no writes)\n" : "\n");

  // ── categories ─────────────────────────────────────────────────────────
  const categoryIds = new Map();
  for (const name of catalogue.categories) {
    const slug = slugify(name);
    let doc = await Category.findOne({ slug });
    if (!doc && !DRY) doc = await Category.create({ name, slug });
    categoryIds.set(name, doc?._id);
    console.log(`  category  ${doc ? "ok " : "new"}  ${name}`);
  }

  // ── products ───────────────────────────────────────────────────────────
  let created = 0, updated = 0, uploaded = 0, skipped = [];
  console.log();

  for (const item of catalogue.products) {
    const categoryId = categoryIds.get(item.category);
    let product = await Product.findOne({ name: item.name });

    // An existing product keeps the image it already has.
    let imageUrl = product?.images?.[0] ?? null;

    if (!item.existing) {
      const file = findImage(item.slug);
      if (!file) {
        skipped.push(item.slug);
        continue;
      }

      // Only re-upload when the file content has actually changed.
      const buf = fs.readFileSync(file);
      const hash = crypto.createHash("md5").update(buf).digest("hex");
      const publicId = `ecommerce-store/${item.slug}`;

      if (manifest[item.slug]?.hash === hash && manifest[item.slug]?.url) {
        imageUrl = manifest[item.slug].url;
      } else if (!DRY) {
        const dataUri = `data:${mimeFor(file)};base64,${buf.toString("base64")}`;
        const res = await cloudinary.uploader.upload(dataUri, {
          public_id: publicId,
          overwrite: true,
          invalidate: true,
          // Normalise wildly different source sizes to one card-friendly shape.
          transformation: [{ width: 1000, height: 1000, crop: "limit", quality: "auto:good" }],
        });
        imageUrl = res.secure_url;
        manifest[item.slug] = { hash, url: imageUrl, file: path.basename(file) };
        uploaded++;
      }
    }

    if (DRY) {
      console.log(`  ${product ? "update" : "create"}  ${item.name}`);
      continue;
    }

    const fields = {
      name: item.name,
      price: item.price,
      stock: item.stock,
      category: categoryId,
      ...(item.description ? { description: item.description } : {}),
      ...(imageUrl ? { images: [imageUrl] } : {}),
    };

    if (product) {
      Object.assign(product, fields);
      await product.save();
      updated++;
    } else {
      await Product.create({ ...fields, description: item.description ?? item.name });
      created++;
    }
  }

  if (!DRY) fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2));

  const total = await Product.countDocuments();
  console.log(`\n  created ${created} | updated ${updated} | images uploaded ${uploaded}`);
  if (skipped.length) {
    console.log(`\n  SKIPPED — no image file found (${skipped.length}):`);
    for (const s of skipped) console.log(`    ${s}`);
    console.log(`\n  Add ${EXTS.join("/")} files named as above to scripts/product-images/ and re-run.`);
  }
  console.log(`\n  catalogue now holds ${total} products in ${await Category.countDocuments()} categories`);

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
