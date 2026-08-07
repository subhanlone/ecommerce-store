"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import CartSync from "@/components/customer/CartSync";
import WishlistSync from "@/components/customer/WishlistSync";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartSync />
      <WishlistSync />
      {children}
      <Toaster position="top-center" />
    </SessionProvider>
  );
}
