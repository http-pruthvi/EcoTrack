"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  UserProfile,
  onAuthStateChange,
  loginUser,
  registerUser,
  loginWithGoogle as googleLogin,
  logoutUser
} from "@/lib/firebase";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: typeof loginUser;
  register: typeof registerUser;
  signInWithGoogle: typeof googleLogin;
  logout: typeof logoutUser;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const handleAuthState = (updatedUser: UserProfile | null) => {
    setUser(updatedUser);
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChange(handleAuthState);
    return () => unsubscribe();
  }, []);

  // Force refreshes user state from Firestore
  const refreshUser = async () => {
    if (!user) return;
    try {
      const profiles = localStorage.getItem("ecotrack_profiles");
      if (profiles) {
        const parsed = JSON.parse(profiles);
        if (parsed[user.uid]) {
          setUser(parsed[user.uid]);
        }
      }
    } catch (e) {
      console.error("Error refreshing user:", e);
    }
  };

  // Route protection and redirection checks
  useEffect(() => {
    if (loading) return;

    const isDashboardRoute = pathname?.startsWith("/dashboard");
    const isOnboardingRoute = pathname === "/onboarding";
    const isLoginRoute = pathname === "/login";

    if (!user) {
      // Unauthenticated users trying to access dashboard/onboarding are sent to login
      if (isDashboardRoute || isOnboardingRoute) {
        router.push("/login");
      }
    } else {
      // Authenticated users
      if (!user.onboardingComplete) {
        // Must complete onboarding first
        if (!isOnboardingRoute) {
          router.push("/onboarding");
        }
      } else {
        // Onboarding complete
        if (isLoginRoute || isOnboardingRoute) {
          // Already set up, send to dashboard
          router.push("/dashboard");
        }
      }
    }
  }, [user, loading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login: async (email: string, password: string) => {
          setLoading(true);
          try {
            const res = await loginUser(email, password);
            setUser(res);
            return res;
          } finally {
            setLoading(false);
          }
        },
        register: async (email: string, password: string, displayName: string) => {
          setLoading(true);
          try {
            const res = await registerUser(email, password, displayName);
            setUser(res);
            return res;
          } finally {
            setLoading(false);
          }
        },
        signInWithGoogle: async () => {
          setLoading(true);
          try {
            const res = await googleLogin();
            setUser(res);
            return res;
          } finally {
            setLoading(false);
          }
        },
        logout: async () => {
          setLoading(true);
          try {
            await logoutUser();
            setUser(null);
            router.push("/");
          } finally {
            setLoading(false);
          }
        },
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
