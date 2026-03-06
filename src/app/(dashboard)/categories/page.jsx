"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import CategoryManager from "@/components/features/eventadmin/CategoryManager";

export default function CategoriesPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <CategoryManager />,
      }}
    />
  );
}
