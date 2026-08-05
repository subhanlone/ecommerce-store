"use client";

import { SessionProvider } from "next-auth/react";
import { Toaster } from "react-hot-toast";
import CartSync from "@/components/customer/CartSync";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <CartSync />
      {children}
      <Toaster position="top-center" />
    </SessionProvider>
  );
}
