"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import UserManagement from "@/components/features/superadmin/UserManagement";

export default function UsersPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <UserManagement />
      }}
    />
  );
}
