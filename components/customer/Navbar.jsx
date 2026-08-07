"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
];

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      className="h-5 w-5"
      aria-hidden="true"
    >
      <circle cx="9" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <circle cx="18" cy="20" r="1.4" fill="currentColor" stroke="none" />
      <path
        d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h7.6a2 2 0 0 0 2-1.6L21 8H6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Navbar() {
  const { status } = useSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const rawCartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

  // Cart is rehydrated from localStorage after mount, so it's always empty
  // during SSR. Ignoring it until mounted keeps the first client render
  // matching the server and avoids a hydration mismatch on the badge.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const cartCount = mounted ? rawCartCount : 0;

  const search = (e) => {
    e.preventDefault();
    const query = new FormData(e.currentTarget).get("q");
    setMenuOpen(false);
    router.push(`/products?q=${encodeURIComponent(query || "")}`);
  };

  const logout = async () => {
    // Sign out first so the session is invalidated server-side before we
    // clear local state — clearing first races CartSync's sync-to-server
    // effect (still "authenticated" for a tick) and can PUT an empty cart,
    // wiping the account's saved cart in the DB.
    await signOut({ redirect: false });
    useCartStore.getState().clear();
    useWishlistStore.setState({ items: [] });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:gap-6">
        <Link href="/" className="text-lg font-semibold">
          ShopFront
        </Link>

        <form action="/products" className="hidden flex-1 md:block" onSubmit={search}>
          <input
            type="search"
            name="q"
            aria-label="Search products"
            placeholder="Search products..."
            className="w-full max-w-md rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus-visible:border-accent"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-4 text-sm font-medium md:flex">
          {LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-accent">
              {link.label}
            </Link>
          ))}
          <Link href="/cart" aria-label="Cart" className="relative flex items-center hover:text-accent">
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>
          {status === "authenticated" ? (
            <>
              <Link href="/orders" className="hover:text-accent">
                Orders
              </Link>
              <button type="button" onClick={logout} className="hover:text-accent">
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className="hover:text-accent">
              Login
            </Link>
          )}
        </nav>

        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 md:hidden"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className="text-lg leading-none">{menuOpen ? "✕" : "☰"}</span>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-neutral-200 px-4 py-4 md:hidden">
          <form action="/products" className="mb-4" onSubmit={search}>
            <input
              type="search"
              name="q"
              placeholder="Search products..."
              className="w-full rounded-md border border-neutral-300 px-3 py-1.5 text-sm focus-visible:border-accent"
            />
          </form>

          <nav className="flex flex-col gap-3 text-sm font-medium">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="hover:text-accent"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2 hover:text-accent"
            >
              <CartIcon />
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>
            {status === "authenticated" ? (
              <>
                <Link href="/orders" onClick={() => setMenuOpen(false)} className="hover:text-accent">
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="text-left hover:text-accent"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="hover:text-accent">
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
