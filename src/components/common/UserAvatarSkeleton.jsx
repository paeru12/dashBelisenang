import { Skeleton } from "@/components/ui/skeleton";

export default function UserAvatarSkeleton() {
  return (
    <div className="flex items-center gap-3">
      {/* Text skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>

      {/* Avatar skeleton */}
      <Skeleton className="h-9 w-9 rounded-full" />
    </div>
  );
}
