"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/categories", label: "Categories" },
  { href: "/admin/customers", label: "Customers" },
];

export default function Sidebar({ open, onNavigate }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-30 flex h-full w-60 flex-col border-r border-neutral-200 bg-white transition-transform md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-neutral-200 px-4 py-4 text-lg font-semibold">
        Admin Panel
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                active ? "bg-accent text-accent-foreground" : "text-neutral-700 hover:bg-neutral-100"
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
