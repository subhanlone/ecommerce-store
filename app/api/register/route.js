import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { registerSchema } from "@/lib/validation";

export async function POST(request) {
  const body = await request.json();
  const parsed = registerSchema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid input" },
      { status: 400 }
    );
  }

  const { name, email, password } = parsed.data;

  await connectDB();

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) {
    return Response.json({ error: "Email is already registered" }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name,
    email: email.toLowerCase(),
    password: hashedPassword,
    role: "customer",
  });

  return Response.json({ success: true }, { status: 201 });
}
