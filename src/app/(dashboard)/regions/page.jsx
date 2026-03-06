"use client";

import RequireRole from "@/components/common/RequireRole";
import RegionManager from "@/components/features/eventadmin/RegionManager";

export default function RegionsPage() {
    return (
        <RequireRole allowed={["EVENT_ADMIN", "SUPERADMIN"]}>
            <RegionManager />
        </RequireRole>
    );
}
