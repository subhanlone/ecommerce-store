"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

function mergeCartItems(serverItems, localItems) {
  const merged = new Map(serverItems.map((item) => [item.productId, { ...item }]));

  for (const local of localItems) {
    const server = merged.get(local.productId);
    if (!server) {
      merged.set(local.productId, { ...local });
      continue;
    }

    const stock = server.stock ?? local.stock;
    const qty = Math.max(server.qty, local.qty);
    merged.set(local.productId, {
      ...local,
      ...server,
      qty: stock == null ? qty : Math.min(qty, stock),
    });
  }

  return [...merged.values()];
}

function waitForStoreHydration() {
  if (useCartStore.persist.hasHydrated()) return Promise.resolve();
  return new Promise((resolve) => {
    const unsubscribe = useCartStore.persist.onFinishHydration(() => {
      unsubscribe();
      resolve();
    });
  });
}

export default function CartSync() {
  const { data: session, status } = useSession();
  const items = useCartStore((state) => state.items);
  const replace = useCartStore((state) => state.replace);
  const fetchStartedRef = useRef(false);
  const hydratedRef = useRef(false);
  const skipNextSync = useRef(false);

  // Merge once after both the authenticated session and Zustand persistence
  // are ready. Taking the maximum quantity makes the merge idempotent: a
  // session expiry followed by another login cannot add the same cart twice.
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
      const res = await fetch("/api/cart");
      const data = res.ok ? await res.json() : null;
      if (cancelled) return;

      if (data) {
        const merged = mergeCartItems(data.items, useCartStore.getState().items);
        skipNextSync.current = true;
        replace(merged);
        await fetch("/api/cart", {
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
  }, [status, session?.user?.role, replace]);

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

    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [items, status, session?.user?.role]);

  return null;
}
