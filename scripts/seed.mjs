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

// Prices are in PKR, whole rupees — see lib/constants.js.
const productsByCategory = {
  electronics: [
    { name: "Wireless Headphones", price: 8999, stock: 25 },
    { name: "Bluetooth Speaker", price: 6499, stock: 40 },
    { name: "Smartwatch", price: 14999, stock: 15 },
  ],
  clothing: [
    { name: "Cotton T-Shirt", price: 1499, stock: 100 },
    { name: "Denim Jacket", price: 4999, stock: 30 },
  ],
  "home-kitchen": [
    { name: "Ceramic Mug Set", price: 2199, stock: 60 },
    { name: "Non-Stick Pan", price: 3499, stock: 20 },
  ],
  books: [
    { name: "The Pragmatic Programmer", price: 3200, stock: 12 },
    { name: "Atomic Habits", price: 1850, stock: 50 },
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
