"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import CreatorSidebar from "./utils/Sidebars";
import { SquareSplitHorizontal } from "lucide-react";

export default function CreatorLayoutClient({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  if (loading) return null;
  if (!user) return null;

  const currentPageName =
    pathname.split("/").pop()?.replaceAll("-", " ") || "Dashboard";

  return (
    <div className="flex h-screen overflow-hidden bg-white/50">

      {/* SIDEBAR */}
      <CreatorSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />

      {/* CONTENT */}
      <div className="flex-1 flex flex-col overflow-hidden">

        {/* HEADER */}
        <header className="h-16 shrink-0 flex items-center justify-between px-4 lg:px-8 
  bg-gradient-to-l from-teal-50 via-slate-50 to-white 
  border-b border-slate-200 shadow-sm">

          <div className="flex items-center gap-4">

            {/* MOBILE MENU BUTTON */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-slate-100 transition"
            >
              <SquareSplitHorizontal className="w-5 h-5 text-slate-700" />
            </button>

            <h1 className="text-xl font-semibold text-slate-900 capitalize tracking-tight">
              {currentPageName}
            </h1>

          </div>
        </header>


        {/* MAIN SCROLL AREA */}
        <main className="flex-1 overflow-y-auto p-8 scrolly">
          {children}
          <footer className="border-t text-center my-10 mb-0 pt-5 text-sm">
            <p className="text-sm text-slate-400">
              © 2026 Belisenang. Built with care by{" "}
              <a
                href="https://yukti.id"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                Yukti.id
              </a>
            </p>
          </footer>
        </main>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 lg:hidden
               transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

    </div>
  );
}
