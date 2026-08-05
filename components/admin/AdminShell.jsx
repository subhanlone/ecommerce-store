"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "@/components/admin/Sidebar";

export default function AdminShell({ userName, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 flex-col md:ml-0">
        <header className="flex items-center justify-between border-b border-neutral-200 bg-white px-4 py-3 md:justify-end md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="flex h-9 w-9 items-center justify-center rounded-md border border-neutral-300 md:hidden"
            aria-label="Toggle menu"
            aria-expanded={sidebarOpen}
          >
            <span className="text-lg leading-none">{sidebarOpen ? "✕" : "☰"}</span>
          </button>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-600">{userName}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-sm font-medium text-neutral-700 hover:text-accent"
            >
              Log out
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-x-auto bg-neutral-50 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
