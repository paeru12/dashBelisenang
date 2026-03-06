"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import BannerManagement from "@/components/features/superadmin/BannerManagement";

export default function BannerPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <BannerManagement />
      }}
    />
  );
}
