"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlistStore";

function mergeWishlistItems(serverItems, localItems) {
  return [...new Map(
    [...serverItems, ...localItems].map((item) => [item.productId, item])
  ).values()];
}

function waitForStoreHydration() {
  if (useWishlistStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useWishlistStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export default function WishlistSync() {
  const { data: session, status } = useSession();
  const items = useWishlistStore((state) => state.items);
  const fetchStartedRef = useRef(false);
  const hydratedRef = useRef(false);
  const skipNextSync = useRef(false);

  // The union is idempotent, so an item that exists locally and in MongoDB is
  // still stored exactly once after any later login.
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "customer") {
      fetchStartedRef.current = false;
      hydratedRef.current = false;
      return;
    }
    if (fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    let cancelled = false;

    async function hydrateAndSync() {
      await waitForStoreHydration();
      const res = await fetch("/api/wishlist");
      const data = res.ok ? await res.json() : null;
      if (cancelled) return;

      if (data) {
        const merged = mergeWishlistItems(data.items, useWishlistStore.getState().items);
        skipNextSync.current = true;
        useWishlistStore.setState({ items: merged });
        await fetch("/api/wishlist", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: merged }),
        });
      }
      hydratedRef.current = true;
    }

    hydrateAndSync();
    return () => {
      cancelled = true;
    };
  }, [status, session?.user?.role]);

  useEffect(() => {
    if (
      status !== "authenticated" ||
      session?.user?.role !== "customer" ||
      !hydratedRef.current
    ) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [items, status, session?.user?.role]);

  return null;
}
