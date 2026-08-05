import mongoose from "mongoose";

// Side-effect imports: register every schema up front so populate() calls
// never race a model that hasn't been touched directly by the current route
// (Mongoose only registers a model once its file has actually been imported).
import "@/models/User";
import "@/models/Product";
import "@/models/Category";
import "@/models/Order";
import "@/models/Cart";
import "@/models/Review";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("Missing MONGODB_URI environment variable");
}

let cached = global._mongoose;

if (!cached) {
  cached = global._mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(MONGODB_URI, { bufferCommands: false, dbName: "ecommerce-store" })
      .then((mongoose) => mongoose);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}
