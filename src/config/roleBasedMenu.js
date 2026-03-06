import {
  LayoutDashboard,
  Ticket,
  Users,
  CalendarCheck,
  FileText,
  Settings,
  Image,
  History,
  List,
  UserStar,
  Hotel,
  WalletIcon
} from "lucide-react";

export const roleMenus = {
  SUPERADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Banner", href: "/banner", icon: Image },
    { name: "Categories", href: "/categories", icon: List },
    { name: "Fasilitas", href: "/fasilitas", icon: Hotel  },
    { name: "Organizer", href: "/organizers", icon: UserStar },    
    { name: "Payout", href: "/payout", icon: WalletIcon },
    { name: "Users", href: "/users", icon: Users },
    { name: "Administrator", href: "/administrator", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ],

  SYSTEM_ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Payout", href: "/payout", icon: WalletIcon },
    { name: "Settings", href: "/settings", icon: Settings },
  ],

  CONTENT_WRITER: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Articles", href: "/articles", icon: FileText },
  ],

  PROMOTOR_OWNER: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Events", href: "/events", icon: Ticket },
    { name: "Orders", href: "/orders", icon: Ticket },
    { name: "Payout", href: "/payout", icon: WalletIcon },
    { name: "Administrator", href: "/administrator", icon: Users },
    { name: "Settings", href: "/settings", icon: Settings },
  ],

  PROMOTOR_EVENT_ADMIN: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Events", href: "/events", icon: Ticket },
    { name: "Reports", href: "/reports", icon: FileText },
  ],

  SCAN_STAFF: [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Select Event", href: "/select-event", icon: CalendarCheck },
    { name: "Scan History", href: "/scan-history", icon: History },
  ],
};

export function getMenuByRole(role) {
  return roleMenus[role] || [];
}
