"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function RequireRole({ allowed, children }) {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !allowed.includes(user.role)) {
      router.replace("/dashboard");
    }
  }, [user, allowed, router]);

  if (!user || !allowed.includes(user.role)) {
    return null;
  }

  return children;
}
