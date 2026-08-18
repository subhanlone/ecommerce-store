"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

/**
 * True once the client has hydrated, false during SSR and the hydration render.
 *
 * The cart and wishlist stores rehydrate from localStorage after mount, so they
 * are always empty on the server. Components that read them have to render the
 * empty state first and the real value second, or the markup React produces on
 * the client won't match what the server sent.
 *
 * This replaces the usual `useState(false)` + `useEffect(() => setMounted(true))`
 * pair. That pattern sets state directly inside an effect, which triggers a
 * second cascading render and is flagged by react-hooks/set-state-in-effect.
 * useSyncExternalStore expresses the same thing in one hook: React uses the
 * server snapshot for the hydration render, then swaps to the client snapshot.
 */
export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
