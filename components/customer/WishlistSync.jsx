"use client";

import { useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/store/wishlistStore";

export default function WishlistSync() {
  const { status } = useSession();
  const items = useWishlistStore((s) => s.items);
  const fetchStartedRef = useRef(false);
  const hydratedRef = useRef(false);
  const skipNextSync = useRef(false);

  // Mirrors CartSync: server is the source of truth on every fresh mount
  // while authenticated, fetched once and used to replace local state.
  useEffect(() => {
    if (status !== "authenticated" || fetchStartedRef.current) return;
    fetchStartedRef.current = true;

    fetch("/api/wishlist")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        skipNextSync.current = true;
        if (data) useWishlistStore.setState({ items: data.items });
        hydratedRef.current = true;
      });
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated" || !hydratedRef.current) return;
    if (skipNextSync.current) {
      skipNextSync.current = false;
      return;
    }

    fetch("/api/wishlist", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items }),
    });
  }, [items, status]);

  return null;
}
