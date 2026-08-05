import { redirect } from "next/navigation";
import { auth } from "@/auth";
import AdminShell from "@/components/admin/AdminShell";

export default async function AdminDashboardLayout({ children }) {
  const session = await auth();

  if (!session || session.user?.role !== "admin") {
    redirect("/admin/login");
  }

  return <AdminShell userName={session.user.name}>{children}</AdminShell>;
}
