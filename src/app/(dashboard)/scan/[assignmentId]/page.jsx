"use client";

import { useParams } from "next/navigation";
import useSWR from "swr";
import RoleRenderer from "@/components/common/RoleRenderer";
import ScanQRCode from "@/components/scanstaff/ScanQRCode";
import { getScanAssignments } from "@/lib/scanStaffApi";

const fetcher = async () => {
  const res = await getScanAssignments();
  return res.data.data;
};

export default function ScanPage() {

  const params = useParams();

  const { data, isLoading } = useSWR(
    "scan-assignments",
    fetcher
  );

  if (isLoading) return <div>Loading scanner...</div>;

  const assignment = data?.find(
    (a) => a.id === params.assignmentId
  );

  if (!assignment) {
    return <div>Assignment tidak ditemukan</div>;
  }

  return (
    <RoleRenderer
      map={{
        SCAN_STAFF: (
          <ScanQRCode
            assignmentId={assignment.id}
            eventId={assignment.event_id}
            gate={assignment.assigned_gate}
          />
        ),
      }}
    />
  );
}