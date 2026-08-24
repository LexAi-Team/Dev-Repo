"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User as FirebaseUser, onAuthStateChanged, fetchSignInMethodsForEmail } from "firebase/auth";
import { useRouter, usePathname } from "next/navigation";
import { auth } from "./config";
import {
  signInWithGoogle as fbSignInWithGoogle,
  signInWithEmail as fbSignInWithEmail,
  signUpWithEmail as fbSignUpWithEmail,
  signOutUser as fbSignOut,
  sendPasswordReset as fbResetPassword,
  sendVerificationEmail as fbSendVerification,
} from "./auth";

interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: "STUDENT" | "LAWYER" | "ADMIN" | null;
  avatarUrl: string | null;
}

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: UserProfile | null;
  loading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    role: "STUDENT" | "LAWYER",
    onboardingData: Record<string, unknown>
  ) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
  syncUserProfile: (role?: "STUDENT" | "LAWYER", onboardingData?: Record<string, unknown>) => Promise<void>;
  onboardingRequired: boolean;
  onboardingFirebaseInfo: unknown;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [onboardingRequired, setOnboardingRequired] = useState<boolean>(false);
  const [onboardingFirebaseInfo, setOnboardingFirebaseInfo] = useState<unknown>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const router = useRouter();
  const pathname = usePathname();

  const syncUserProfile = useCallback(async (role?: "STUDENT" | "LAWYER", onboardingData?: Record<string, unknown>) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setLoading(false);
      return;
    }

    try {
      const idToken = await currentUser.getIdToken(true);
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";
      const response = await fetch(`${API_BASE_URL}/auth/sync`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          role,
          name: onboardingData?.name,
          ...onboardingData,
        }),
      });

      if (!response.ok) {
        const errResult = await response.json().catch(() => ({}));
        const message = (errResult as { message?: string }).message || `Server error (${response.status})`;
        throw {
          code: "sync/failed",
          message,
        };
      }

      const result = await response.json() as {
        status: string;
        data?: { user: UserProfile };
        firebaseInfo?: unknown;
      };

      if (result.status === "success" && result.data) {
        setUser(result.data.user);
        setOnboardingRequired(false);
        setOnboardingFirebaseInfo(null);
        setIsAuthenticated(true);

        // Redirect based on role
        const userRole = result.data.user.role;
        if (userRole === "STUDENT" && !pathname.startsWith("/student")) {
          router.push("/student/dashboard");
        } else if (userRole === "LAWYER" && !pathname.startsWith("/lawyer")) {
          router.push("/lawyer/dashboard");
        } else if (userRole === "ADMIN" && !pathname.startsWith("/admin")) {
          router.push("/admin/dashboard");
        }
      } else if (result.status === "onboarding_required") {
        setOnboardingRequired(true);
        setOnboardingFirebaseInfo(result.firebaseInfo || null);
        setUser(null);
        setIsAuthenticated(false);
        
        // If we are not on registration/login page, direct them to register to complete onboarding
        if (pathname !== "/register" && pathname !== "/login") {
          router.push("/register");
        }
      }
    } catch (error: unknown) {
      console.error("[Auth] Backend sync failed:", error);
      setUser(null);
      setIsAuthenticated(false);
      const err = error as { code?: string; message?: string };
      throw {
        code: err?.code || "sync/failed",
        message: err?.message || "Unable to synchronize user profile.",
      };
    }
  }, [pathname, router]);

  const signIn = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    try {
      await fbSignInWithEmail(email, password);
      const fbUser = auth.currentUser;
      if (fbUser && !fbUser.emailVerified) {
        setIsAuthenticated(false);
        setUser(null);
        setLoading(false);
        router.push("/verify-email");
        return;
      }
      await syncUserProfile();
    } catch (error: unknown) {
      try {
        const methods = await fetchSignInMethodsForEmail(auth, email);
        if (methods.includes("google.com") && !methods.includes("password")) {
          throw {
            code: "auth/google-only",
            message: "This account uses Google Sign-In. Please continue with Google.",
          };
        }
      } catch (providerError: unknown) {
        const pErr = providerError as { code?: string };
        if (pErr.code === "auth/google-only") {
          setLoading(false);
          throw providerError;
        }
        console.debug("[Auth] Provider lookup blocked or failed:", providerError);
      }
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: "STUDENT" | "LAWYER",
    onboardingData: Record<string, unknown>
  ): Promise<void> => {
    setLoading(true);
    localStorage.setItem(
      "lexconnect_pending_profile",
      JSON.stringify({
        role,
        name,
        ...onboardingData,
      })
    );

    try {
      const userCredential = await fbSignUpWithEmail(email, password);
      await fbSendVerification(userCredential.user);
      setLoading(false);
      router.push("/verify-email");
    } catch (error) {
      localStorage.removeItem("lexconnect_pending_profile");
      setLoading(false);
      throw error;
    }
  };

  const signInWithGoogle = async (): Promise<void> => {
    setLoading(true);
    try {
      await fbSignInWithGoogle();
      await syncUserProfile();
    } catch (error) {
      setLoading(false);
      throw error;
    }
    setLoading(false);
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    try {
      await fbSignOut();
      setUser(null);
      setFirebaseUser(null);
      setOnboardingRequired(false);
      setOnboardingFirebaseInfo(null);
      setIsAuthenticated(false);
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      setLoading(false);
      router.push("/login");
    } catch (error) {
      setLoading(false);
      throw error;
    }
  };

  const resetPassword = async (email: string): Promise<void> => {
    await fbResetPassword(email);
  };

  const sendVerificationEmail = async (): Promise<void> => {
    if (auth.currentUser) {
      await fbSendVerification(auth.currentUser);
    }
  };

  const refreshUser = async () => {
    setLoading(true);
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        await currentUser.reload();
        setFirebaseUser(currentUser);
        if (currentUser.emailVerified) {
          // Pick up pending onboarding profile
          const pendingStr = localStorage.getItem("lexconnect_pending_profile");
          let pending: Record<string, unknown> = {};
          if (pendingStr) {
            pending = JSON.parse(pendingStr) as Record<string, unknown>;
          }
          await syncUserProfile(
            (pending.role as "STUDENT" | "LAWYER" | undefined) || undefined,
            Object.keys(pending).length > 0 ? pending : undefined
          );
          localStorage.removeItem("lexconnect_pending_profile");
        }
      } catch (reloadErr) {
        console.debug("[Auth] User reload/sync failed:", reloadErr);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);

        // Check if user needs email verification first (excluding Google accounts)
        const isPasswordProvider = fbUser.providerData.some(
          (p) => p.providerId === "password"
        );
        if (isPasswordProvider && !fbUser.emailVerified) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          if (pathname !== "/verify-email") {
            router.push("/verify-email");
          }
          return;
        }

        try {
          const pendingStr = localStorage.getItem("lexconnect_pending_profile");
          if (pendingStr) {
            const pending = JSON.parse(pendingStr) as Record<string, unknown>;
            await syncUserProfile(pending.role as "STUDENT" | "LAWYER" | undefined, pending);
            localStorage.removeItem("lexconnect_pending_profile");
          } else {
            await syncUserProfile();
          }
        } catch (err) {
          console.debug("[Auth] Auth state change sync failed:", err);
          setIsAuthenticated(false);
          setUser(null);
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setOnboardingRequired(false);
        setOnboardingFirebaseInfo(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [pathname, syncUserProfile, router]);

  // Protect paths and enforce auth redirection rules
  useEffect(() => {
    if (loading) return;

    const publicPaths = [
      "/",
      "/login",
      "/register",
      "/forgot-password",
      "/verify-email",
      "/terms",
      "/privacy",
    ];
    const isPublic = publicPaths.includes(pathname);

    if (isAuthenticated && user) {
      // 1. Redirect if visiting login/register/verify-email while authenticated
      if (pathname === "/login" || pathname === "/register" || pathname === "/verify-email") {
        if (user.role === "STUDENT") router.push("/student/dashboard");
        else if (user.role === "LAWYER") router.push("/lawyer/dashboard");
        else if (user.role === "ADMIN") router.push("/admin/dashboard");
        return;
      }

      // 2. Enforce strict role isolation on protected (non-public) paths
      if (!isPublic) {
        if (user.role === "STUDENT" && !pathname.startsWith("/student")) {
          router.push("/student/dashboard");
        } else if (user.role === "LAWYER" && !pathname.startsWith("/lawyer")) {
          router.push("/lawyer/dashboard");
        } else if (user.role === "ADMIN" && !pathname.startsWith("/admin")) {
          router.push("/admin/dashboard");
        } else if (!user.role) {
          if (pathname !== "/register") {
            router.push("/register");
          }
        }
      }
    } else if (!isAuthenticated && !isPublic) {
      // Redirect unauthenticated users trying to access dashboard/platform
      router.push("/login");
    }
  }, [isAuthenticated, user, loading, pathname, router]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        loading,
        isAuthenticated,
        signIn,
        signUp,
        signInWithGoogle,
        signOut,
        resetPassword,
        sendVerificationEmail,
        refreshUser,
        syncUserProfile,
        onboardingRequired,
        onboardingFirebaseInfo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
