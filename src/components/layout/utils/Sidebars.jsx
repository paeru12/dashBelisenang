"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
import { getMenuByRole } from "@/config/roleBasedMenu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { confirmLogout } from "@/lib/alert";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut } from "lucide-react";
import {
  Ticket,
  Users,
  ChevronLeft,
} from "lucide-react";

export default function Sidebars({
  sidebarOpen,
  setSidebarOpen,
  collapsed,
  setCollapsed,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const activeRole =
    user?.activeGlobalRole || user?.activeCreatorRole;

  const menu = activeRole ? getMenuByRole(activeRole) : [];

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40",
        "flex flex-col",
        "transition-transform duration-300 ease-in-out",
        "bg-gradient-to-t from-teal-50 via-slate-50 to-white",
        "border-r border-slate-200",
        collapsed ? "w-20" : "w-64",
        sidebarOpen ? "translate-x-0" : "-translate-x-full",
        "lg:static lg:translate-x-0"
      )}
    >

      <div className="flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2  rounded-xl shadow-md">
            {/* <Ticket className="h-5 w-5 text-white text-center" /> */}
            <img src="/logo.png" alt="" className="h-5 w-5" />
          </div>
          {!collapsed && (
            <span className="text-lg font-semibold text-slate-900 transition-all duration-200 ease-in-out">
              Belisenang.com
            </span>
          )}
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:block"
        >
          <ChevronLeft
            className={cn(
              "ms-1 ps-1 h-5 w-5 text-slate-400 transition-transform transition-all duration-200 ease-in-out hover:cursor-pointer",
              collapsed && "rotate-180"
            )}
          />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto sidebar px-3 ">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = pathname.startsWith(item.href);

          return (
            <button
              key={item.href}
              onClick={() => {
                router.push(item.href);
                setSidebarOpen(false);
              }}
              className={cn(
                "group w-full flex items-center gap-3 mb-2  hover:cursor-pointer px-5 py-3 rounded-xl text-sm font-medium transition-all duration-200 relative",
                isActive
                  ? "bg-white shadow-sm text-slate-900 text-center"
                  : "text-slate-600 hover:bg-white/70 hover:text-slate-900"
              )}
            >
              <Icon size={18} />
              {!collapsed && item.name}
            </button>
          );
        })}
      </div>

      <div className="mt-auto p-3 border-t border-slate-200">

        <DropdownMenu className="w-full">
          <DropdownMenuTrigger asChild>
            <button
              className={cn(
                "w-full flex items-center rounded-xl transition hover:bg-white hover:shadow-md cursor-pointer",
                collapsed
                  ? "justify-center py-3"
                  : "gap-3 px-3 py-3"
              )}
            >

              <Avatar className="h-8 w-8">
                {user?.img ? (
                  <AvatarImage src={user.img} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-indigo-600 text-white font-semibold">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              {!collapsed && (
                <>
                  <div className="flex flex-col text-left overflow-hidden">
                    <span className="text-sm font-semibold text-slate-900 truncate capitalize">
                      {user?.name}
                    </span>
                    <span className="text-xs text-slate-500 truncate">
                      {activeRole?.replaceAll("_", " ")}
                    </span>
                  </div>

                  <ChevronLeft className="ml-auto h-4 w-4 rotate-[-90deg] text-slate-400" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="p-2 w-56">

            <div className="flex items-center gap-2 px-2 py-2">
              <Avatar className="h-8 w-8">
                {user?.img ? (
                  <AvatarImage src={user.img} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-indigo-600 text-white text-xs">
                    {user?.name?.[0]?.toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div>
                <p className="text-sm font-semibold capitalize">
                  {user?.name}
                </p>
                <p className="text-xs text-slate-500">
                  {activeRole?.replaceAll("_", " ")}
                </p>
              </div>
            </div>

            <DropdownMenuSeparator className="my-2" />

            <DropdownMenuItem
              onClick={() => router.push("/profile")}
              className="rounded-lg hover:shadow-md cursor-pointer mb-1"
            >
              <Users className="h-4 w-4 mr-2" />
              Profile
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={async () => {
                const result = await confirmLogout();
                if (!result.isConfirmed) return;
                logout();
                router.push("/login");
              }}
              className="rounded-lg hover:shadow-md cursor-pointer"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Keluar
            </DropdownMenuItem>

          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </aside >
  );
}
