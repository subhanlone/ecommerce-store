// Usage: node --env-file=.env.local scripts/seed.mjs
import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";

const categories = [
  { name: "Electronics", slug: "electronics" },
  { name: "Clothing", slug: "clothing" },
  { name: "Home & Kitchen", slug: "home-kitchen" },
  { name: "Books", slug: "books" },
];

const productsByCategory = {
  electronics: [
    { name: "Wireless Headphones", price: 59.99, stock: 25 },
    { name: "Bluetooth Speaker", price: 34.99, stock: 40 },
    { name: "Smartwatch", price: 89.99, stock: 15 },
  ],
  clothing: [
    { name: "Cotton T-Shirt", price: 14.99, stock: 100 },
    { name: "Denim Jacket", price: 49.99, stock: 30 },
  ],
  "home-kitchen": [
    { name: "Ceramic Mug Set", price: 19.99, stock: 60 },
    { name: "Non-Stick Pan", price: 27.99, stock: 20 },
  ],
  books: [
    { name: "The Pragmatic Programmer", price: 32.5, stock: 12 },
    { name: "Atomic Habits", price: 16.99, stock: 50 },
  ],
};

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "ecommerce-store" });

  await Category.deleteMany({});
  await Product.deleteMany({});

  const createdCategories = await Category.insertMany(categories);
  const categoryMap = new Map(createdCategories.map((c) => [c.slug, c._id]));

  const products = [];
  for (const [slug, items] of Object.entries(productsByCategory)) {
    for (const item of items) {
      products.push({
        ...item,
        description: `${item.name} — a great addition to your ${slug.replace("-", " ")} collection.`,
        category: categoryMap.get(slug),
        images: [],
      });
    }
  }

  await Product.insertMany(products);

  console.log(`Seeded ${createdCategories.length} categories and ${products.length} products.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
