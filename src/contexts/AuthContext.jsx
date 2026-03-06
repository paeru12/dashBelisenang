"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const isFetchingRef = useRef(false);
  const refreshTimerRef = useRef(null);

  const normalizeUser = (u) => ({
    id: u.id,
    email: u.email,
    name: u.name,
    img: u.img,
    creator_id: u.creator_id,
    globalRoles: u.globalRoles || [],
    creatorRoles: u.creatorRoles || [],
    activeGlobalRole: u.globalRoles?.[0] || null,
    activeCreatorRole: u.creatorRoles?.[0] || null,
  });

  const startTokenWatcher = (exp) => {
    if (!exp) return;

    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
    }

    const expireTime = exp * 1000;

    const refreshDelay = expireTime - Date.now() - 60 * 1000;

    if (refreshDelay > 0) {
      refreshTimerRef.current = setTimeout(() => {
        fetchMe();
      }, refreshDelay);
    }
  };

  const fetchMe = async () => {
    if (isFetchingRef.current) return;

    isFetchingRef.current = true;

    try {
      const res = await api.get("/auth/admin/me");

      const normalized = normalizeUser(res.data.user);
      setUser(normalized);

      startTokenWatcher(res.data.exp);
    } catch (err) {
      if (err.response?.status === 401) {
        return;
      }
      setUser(null);
    }
    finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };


  // ==============================
  // INITIAL LOAD
  // ==============================
  useEffect(() => {
    fetchMe();

    const onLogout = () => setUser(null);

    window.addEventListener("auth:logout", onLogout);

    return () => {
      window.removeEventListener("auth:logout", onLogout);
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, []);

  // ==============================
  // LOGIN
  // ==============================
  const login = async (email, password) => {
    await api.post("/auth/admin/login", { email, password });

    await fetchMe(); // ambil user + start timer

    return true;
  };

  // ==============================
  // LOGOUT
  // ==============================
  const logout = async () => {
    try {
      await api.post("/auth/admin/logout");
    } catch { }

    setUser(null);

    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }

    window.dispatchEvent(new Event("auth:logout"));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refetchMe: fetchMe,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}