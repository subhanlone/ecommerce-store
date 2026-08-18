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
      className={`fixed inset-y-0 left-0 z-30 flex h-full w-60 flex-col border-r border-line bg-surface transition-transform duration-200 md:static md:translate-x-0 ${
        open ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="border-b border-line px-4 py-4">
        <p className="text-lg font-semibold tracking-tight text-text">ShopFront</p>
        <p className="label-caps text-[10px] text-text-subtle">Admin panel</p>
      </div>

      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {LINKS.map((link) => {
          const active =
            link.href === "/admin" ? pathname === "/admin" : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              /*
                The active row was a solid accent block. That reads as a button
                you can press rather than a statement of where you are, and it
                puts the strongest colour in the app on a passive element. A
                tinted row with an accent rule says the same thing more quietly
                and leaves the solid accent to mean "action".
              */
              className={`flex h-10 items-center rounded-lg px-3 text-sm font-medium transition-colors ${
                active
                  ? "border-l-2 border-accent bg-accent-subtle text-accent"
                  : "text-text-muted hover:bg-surface-muted hover:text-text"
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
