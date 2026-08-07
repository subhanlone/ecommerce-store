import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

// Runs once, explicitly, at the moment of login/registration — combines
// whatever was in the guest's local cart with their existing DB cart and
// saves the result. CartSync's mount effect is a plain fetch-and-replace,
// so merging must happen here rather than in an effect (an effect would
// re-run on every fresh page load and re-add the same local items each time).
export async function mergeGuestCartOnLogin() {
  const localItems = useCartStore.getState().items;

  const res = await fetch("/api/cart");
  if (!res.ok) return;
  const { items: serverItems } = await res.json();

  const merged = serverItems.map((item) => ({ ...item }));
  for (const local of localItems) {
    const match = merged.find((item) => item.productId === local.productId);
    if (match) {
      const maxQty = match.stock ?? match.qty + local.qty;
      match.qty = Math.min(match.qty + local.qty, maxQty);
    } else {
      merged.push(local);
    }
  }

  useCartStore.getState().replace(merged);

  await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: merged }),
  });
}

// Same idea as mergeGuestCartOnLogin, for the wishlist's own server store.
export async function mergeGuestWishlistOnLogin() {
  const localItems = useWishlistStore.getState().items;

  const res = await fetch("/api/wishlist");
  if (!res.ok) return;
  const { items: serverItems } = await res.json();

  const merged = serverItems.map((item) => ({ ...item }));
  for (const local of localItems) {
    if (!merged.some((item) => item.productId === local.productId)) {
      merged.push(local);
    }
  }

  useWishlistStore.setState({ items: merged });

  await fetch("/api/wishlist", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items: merged }),
  });
}
