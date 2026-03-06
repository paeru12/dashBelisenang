"use client";

import RoleRenderer from "@/components/common/RoleRenderer";
import ProfileView from "@/components/profile/ProfileView";
import GlobalProfile from "@/components/profile/globalProfile";

export default function ProfilePage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <GlobalProfile />,
        PROMOTOR_OWNER: <ProfileView />,
        PROMOTOR_EVENT_ADMIN: <ProfileView />,
        SCAN_STAFF: <ProfileView />,
      }}
    />
  );
}
 