"use client";
import { useParams } from "next/navigation";
import RoleRenderer from "@/components/common/RoleRenderer";
import ScanQRCode from "@/components/scanstaff/ScanQRCode";

export default function SelectEventPage() {
    const params = useParams();
  return (
    <RoleRenderer
      map={{
        SCAN_STAFF: <ScanQRCode assignmentId={params.assignmentId} />
      }}
    />
  );
}

// "use client";

// 
// import ScanQRCode from "@/components/scanstaff/ScanQRCode";

// export default function ScanPage() {

//   const params = useParams();

//   return (

//     <ScanQRCode
//       assignmentId={params.assignmentId}
//     />

//   );

// }