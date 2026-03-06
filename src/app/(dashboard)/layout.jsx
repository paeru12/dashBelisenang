"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardLayout({children}){

  const {user} = useAuth();
  const router = useRouter();

  useEffect(()=>{

    if(!user){
      router.replace("/login");
    }

  },[user]);

  if(!user) return null;

  return children;

}