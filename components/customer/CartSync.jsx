"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/store/cartStore";

export default function CartSync() {
  const { status } = useSession();
  const items = useCartStore((s) => s.items);
  const replace = useCartStore((s) => s.replace);
  const fetchStartedRef = useRef(false);
  const hydratedRef = useRef(false);
  const skipNextSync = useRef(false);

  // On every fresh mount while authenticated, server is the source of truth —
  // fetch and replace. Safe to run on every page load: unlike a merge, this
  // can't compound, since it never adds to what's already there.
  //
  // hydratedRef only flips true once the fetch resolves (not when it starts).
  // Until then the sync-to-server effect below stays gated, so it can never
  // PUT a stale pre-hydration items value (e.g. zustand's persisted state
  // before it rehydrates from localStorage) and wipe the server cart.
  useEffect(() => {
    if (status !== "authenticated" || fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    fetch("/api/cart")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        skipNextSync.current = true;
        if (data) replace(data.items);
        hydratedRef.current = true;
      });
  }, [status, replace]);

  useEffect(() => {
    if (status !== "authenticated" || !hydratedRef.current) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    fetch("/api/cart", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [items, status]);

  return null;
}
