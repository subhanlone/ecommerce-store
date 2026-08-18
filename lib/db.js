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

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Drop the rejected promise so the next request attempts a fresh connect.
    // Without this the first failure is cached permanently: every later call
    // re-awaits the same rejected promise, so a process that started during a
    // database outage stays broken until it is restarted, even after the
    // database comes back. On serverless that means a warm instance keeps
    // serving errors long after the outage has ended.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
