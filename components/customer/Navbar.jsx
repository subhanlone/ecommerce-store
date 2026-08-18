"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { useHydrated } from "@/lib/useHydrated";
import { MenuIcon, CloseIcon, CartIcon, SearchIcon } from "@/components/ui/icons";

const LINKS = [
  { href: "/products", label: "Products" },
  { href: "/wishlist", label: "Wishlist" },
];

export default function Navbar() {
  const { status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const rawCartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));

  // Cart is rehydrated from localStorage after mount, so it's always empty
  // during SSR. Ignoring it until hydrated keeps the first client render
  // matching the server and avoids a hydration mismatch on the badge.
  const hydrated = useHydrated();
  const cartCount = hydrated ? rawCartCount : 0;

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

  // A nav that doesn't say where you are makes the user work it out from the
  // page content. aria-current carries the same fact to a screen reader.
  const isActive = (href) => pathname === href || pathname.startsWith(`${href}/`);

  const navLinkClass = (href) =>
    `transition-colors ${isActive(href) ? "text-accent" : "text-text-muted hover:text-text"}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-4 px-4 py-3 md:gap-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-text">
          ShopFront
        </Link>

        <form action="/products" className="hidden flex-1 md:block" onSubmit={search}>
          <div className="relative max-w-md">
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
            <input
              type="search"
              name="q"
              aria-label="Search products"
              placeholder="Search products..."
              className="h-10 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-sm text-text transition-colors placeholder:text-text-subtle hover:border-text-subtle"
            />
          </div>
        </form>

        <nav className="ml-auto hidden items-center gap-5 text-sm font-medium md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? "page" : undefined}
              className={navLinkClass(link.href)}
            >
              {link.label}
            </Link>
          ))}

          <Link
            href="/cart"
            aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : "Cart"}
            aria-current={isActive("/cart") ? "page" : undefined}
            className={`relative flex h-10 w-10 items-center justify-center rounded-lg ${
              isActive("/cart") ? "text-accent" : "text-text-muted hover:bg-surface-muted hover:text-text"
            } transition-colors`}
          >
            <CartIcon />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-foreground">
                {cartCount}
              </span>
            )}
          </Link>

          {status === "authenticated" ? (
            <>
              <Link
                href="/orders"
                aria-current={isActive("/orders") ? "page" : undefined}
                className={navLinkClass("/orders")}
              >
                Orders
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-text-muted transition-colors hover:text-text"
              >
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className={navLinkClass("/login")}>
              Login
            </Link>
          )}
        </nav>

        {/* 44px square: the platform minimum for a touch target. */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="ml-auto flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-text transition-colors hover:bg-surface-muted md:hidden"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-line px-4 py-4 md:hidden">
          <form action="/products" className="mb-4" onSubmit={search}>
            <div className="relative">
              <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-subtle" />
              <input
                type="search"
                name="q"
                aria-label="Search products"
                placeholder="Search products..."
                className="h-11 w-full rounded-lg border border-line-strong bg-surface pl-9 pr-3 text-sm text-text placeholder:text-text-subtle"
              />
            </div>
          </form>

          <nav className="flex flex-col text-sm font-medium">
            {LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`flex h-11 items-center ${
                  isActive(link.href) ? "text-accent" : "text-text-muted"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <Link
              href="/cart"
              onClick={() => setMenuOpen(false)}
              className={`flex h-11 items-center gap-2 ${
                isActive("/cart") ? "text-accent" : "text-text-muted"
              }`}
            >
              <CartIcon className="h-5 w-5" />
              Cart{cartCount > 0 ? ` (${cartCount})` : ""}
            </Link>

            {status === "authenticated" ? (
              <>
                <Link
                  href="/orders"
                  onClick={() => setMenuOpen(false)}
                  className={`flex h-11 items-center ${
                    isActive("/orders") ? "text-accent" : "text-text-muted"
                  }`}
                >
                  Orders
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    logout();
                  }}
                  className="flex h-11 items-center text-left text-text-muted"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="flex h-11 items-center text-text-muted"
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
