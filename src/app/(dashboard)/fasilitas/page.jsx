"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import FasilitasManagement from "@/components/features/superadmin/FasilitasManagement";

export default function Fasilitas() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <FasilitasManagement />,
        SYSTEM_ADMIN: <FasilitasManagement />,
      }}
    />
  );
}
