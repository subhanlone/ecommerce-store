// Usage: node --env-file=.env.local scripts/createAdmin.mjs <email> <password> [name]
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

const [, , email, password, name = "Admin"] = process.argv;

if (!email || !password) {
  console.error("Usage: node --env-file=.env.local scripts/createAdmin.mjs <email> <password> [name]");
  process.exit(1);
}

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { dbName: "ecommerce-store" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const existing = await User.findOne({ email: email.toLowerCase() });

  if (existing) {
    existing.role = "admin";
    existing.password = hashedPassword;
    existing.name = name;
    await existing.save();
    console.log(`Updated existing user ${email} to admin.`);
  } else {
    await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: "admin",
    });
    console.log(`Created admin user ${email}.`);
  }

  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
