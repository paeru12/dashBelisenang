import RoleRenderer from "@/components/common/RoleRenderer";
import CreatorManagement from "@/components/features/superadmin/CreatorManagement";
// import OrganizerManagement from "@/components/features/owner/OrganizerManagement";

export default function CreatorPage() {
  return (
    <RoleRenderer
      map={{
        SUPERADMIN: <CreatorManagement />,
        // PROMOTOR_OWNER: <OrganizerManagement />
      }}
    />
  );
}
