"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import Sidebar from "@/components/admin/Sidebar";
import { MenuIcon, CloseIcon } from "@/components/ui/icons";

export default function AdminShell({ userName, children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-text/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:justify-end md:px-6">
          <button
            type="button"
            onClick={() => setSidebarOpen((open) => !open)}
            className="flex h-11 w-11 items-center justify-center rounded-lg border border-line-strong text-text transition-colors hover:bg-surface-muted md:hidden"
            aria-label={sidebarOpen ? "Close menu" : "Open menu"}
            aria-expanded={sidebarOpen}
          >
            {sidebarOpen ? <CloseIcon /> : <MenuIcon />}
          </button>

          <div className="flex items-center gap-4">
            <span className="text-sm text-text-muted">{userName}</span>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/admin/login" })}
              className="text-sm font-medium text-text-muted transition-colors hover:text-accent"
            >
              Log out
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-x-auto bg-surface-sunken p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
