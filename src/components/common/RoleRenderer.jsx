"use client";

import { useAuth } from "@/contexts/AuthContext";

export default function RoleRenderer({ map }) {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <div>Akses ditolak</div>;

  // ===============================
  // ROLE PRIORITY SYSTEM
  // ===============================

  const priorityOrder = [
    "SUPERADMIN",
    "SYSTEM_ADMIN",
    "CONTENT_WRITER",
    "PROMOTOR_OWNER",
    "PROMOTOR_EVENT_ADMIN",
    "SCAN_STAFF",
  ];

  const userRoles = [
    ...(user.globalRoles || []),
    ...(user.creatorRoles || []),
  ];

  const activeRole = priorityOrder.find((role) =>
    userRoles.includes(role)
  );

  if (!activeRole)
    return <div>Akses tidak diizinkan</div>;

  const Component = map[activeRole];

  if (!Component)
    return <div>Role tidak memiliki akses halaman ini</div>;

  return Component;
}
