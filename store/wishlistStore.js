import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      items: [],

      toggleItem: (product) => {
        set((state) => {
          const exists = state.items.some((i) => i.productId === product._id);
          if (exists) {
            return { items: state.items.filter((i) => i.productId !== product._id) };
          }
          return {
            items: [
              ...state.items,
              {
                productId: product._id,
                name: product.name,
                price: product.price,
                image: product.images?.[0] || null,
              },
            ],
          };
        });
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }));
      },

      isWishlisted: (productId) => get().items.some((i) => i.productId === productId),
    }),
    { name: "wishlist-storage" }
  )
);
