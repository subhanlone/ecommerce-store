import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) => i.productId === product._id);
          if (existing) {
            const maxQty = product.stock ?? existing.qty + qty;
            return {
              items: state.items.map((i) =>
                i.productId === product._id
                  ? { ...i, qty: Math.min(i.qty + qty, maxQty) }
                  : i
              ),
            };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || null,
                stock: product.stock,
                qty,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      updateQty: (productId, qty) => {
        if (qty < 1) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.productId === productId ? { ...i, qty } : i)),
        }));
      },

      clear: () => set({ items: [] }),

      replace: (items) => set({ items }),

      total: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
    }),
    { name: "cart-storage" }
  )
);
