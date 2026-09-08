// Usage:
//   npm run seed -- --dry-run   # report what would be added
//   npm run seed                # add only missing sample records
//
// This seeder is deliberately non-destructive. It never deletes or overwrites
// existing catalogue data, so it is safe to run more than once.
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const dryRun = process.argv.includes("--dry-run");

const samples = [
  {
    category: { name: "Electronics", slug: "electronics" },
    products: [
      {
        name: "Wireless Headphones",
        description: "Comfortable wireless headphones with clear sound and all-day battery life.",
        price: 8999,
        stock: 25,
      },
      {
        name: "Bluetooth Speaker",
        description: "Portable Bluetooth speaker with balanced sound and a compact design.",
        price: 6499,
        stock: 40,
      },
    ],
  },
  {
    category: { name: "Books & Stationery", slug: "books-stationery" },
    products: [
      {
        name: "The Pragmatic Programmer",
        description: "A practical software-development book for building durable engineering habits.",
        price: 3200,
        stock: 12,
      },
      {
        name: "Hardcover Notebook",
        description: "A ruled hardcover notebook for everyday notes, planning, and study.",
        price: 950,
        stock: 50,
      },
    ],
  },
];

function requireMongoUri() {
  if (!process.env.MONGODB_URI) {
    throw new Error("Missing MONGODB_URI. Add it to .env.local before running the seeder.");
  }
}

async function main() {
  requireMongoUri();
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "ecommerce-store" });

  let categoriesToCreate = 0;
  let productsToCreate = 0;

  for (const sample of samples) {
    let category = await Category.findOne({ slug: sample.category.slug });

    if (!category) {
      categoriesToCreate += 1;
      if (!dryRun) {
        category = await Category.create(sample.category);
      }
    }

    for (const product of sample.products) {
      const categoryId = category?._id;
      const existing = categoryId
        ? await Product.exists({ name: product.name, category: categoryId })
        : false;

      if (existing) continue;
      productsToCreate += 1;

      if (!dryRun) {
        await Product.create({
          ...product,
          category: categoryId,
          images: [],
          variants: [],
        });
      }
    }
  }

  const prefix = dryRun ? "Dry run:" : "Seed complete:";
  console.log(
    `${prefix} ${categoriesToCreate} missing categor${categoriesToCreate === 1 ? "y" : "ies"} and ` +
      `${productsToCreate} missing product${productsToCreate === 1 ? "" : "s"}.`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
