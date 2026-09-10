import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";

// JWT sessions carry no server-side record, so a session signed before a user
// was deleted (or before their role changed) stays valid until the token
// expires. Re-checking against the User collection here closes that gap for
// every route that calls requireUser/requireAdmin, instead of trusting the
// token's claims for up to 30 days after the account is gone.
async function currentUser(session) {
  if (!session?.user?.id) return null;
  await connectDB();
  const user = await User.findById(session.user.id).select("role").lean();
  return user;
}

export async function requireAdmin() {
  const session = await auth();
  const user = await currentUser(session);
  if (!user || user.role !== "admin") {
    return null;
  }
  return session;
}

export async function requireUser() {
  const session = await auth();
  const user = await currentUser(session);
  if (!user) {
    return null;
  }
  return session;
}
