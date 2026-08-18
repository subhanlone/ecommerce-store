import Link from "next/link";

const LINKS = [
  { href: "/products", label: "All products" },
  { href: "/cart", label: "Cart" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/orders", label: "Orders" },
];

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold tracking-tight text-text">ShopFront</p>
          <p className="mt-1 text-sm text-text-muted">
            Cash on delivery across all orders.
          </p>
        </div>

        <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-text-muted transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-line">
        <p className="mx-auto max-w-6xl px-4 py-4 text-xs text-text-subtle">
          &copy; {new Date().getFullYear()} ShopFront. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
