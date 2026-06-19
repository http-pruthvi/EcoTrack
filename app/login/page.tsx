"use client";

import React, { useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Leaf, Lock, Mail, User, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { login, register, signInWithGoogle } = useAuth();

  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        if (!displayName.trim()) {
          throw new Error("Please enter your display name");
        }
        await register(email, password, displayName);
      } else {
        await login(email, password);
      }
      // On success, redirecting is handled by AuthProvider useEffect
    } catch (err) {
      const error = err as Error & { code?: string };
      const expectedCodes = [
        "auth/invalid-credential",
        "auth/email-already-in-use",
        "auth/weak-password",
        "auth/invalid-email"
      ];
      const isExpected = expectedCodes.includes(error.code || "") || 
                         expectedCodes.some(code => error.message?.includes(code)) ||
                         error.message === "Please enter your display name";
      if (isExpected) {
        console.warn("Auth warning:", error.message || error);
      } else {
        console.error("Auth error:", error);
      }
      let errMsg = "An unexpected authentication error occurred.";
      if (error.message) {
        errMsg = error.message;
      }
      
      // Friendly Firestore mapping
      if (error.code === "auth/invalid-credential" || error.message?.includes("invalid-credential")) {
        errMsg = "incorrect email or password. please double check your details.";
      } else if (error.code === "auth/email-already-in-use" || error.message?.includes("email-already-in-use")) {
        errMsg = "this email is already registered. try signing in instead.";
      } else if (error.code === "auth/weak-password" || error.message?.includes("weak-password")) {
        errMsg = "password must be at least 6 characters long.";
      } else if (error.code === "auth/invalid-email" || error.message?.includes("invalid-email")) {
        errMsg = "please enter a valid email address.";
      }
      
      setError(errMsg.toLowerCase());
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (err) {
      const error = err as Error & { code?: string };
      const isCancel = error.code === "auth/popup-closed-by-user" || 
                      error.message?.includes("auth/popup-closed-by-user") || 
                      error.message?.includes("popup-closed-by-user");
      if (isCancel) {
        console.warn("Google sign in canceled by user.");
      } else {
        console.error("Google sign in error:", error);
      }
      setError("google sign in failed. please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex flex-col gap-6">
        
        {/* Logo Banner */}
        <div className="flex flex-col items-center text-center gap-1.5">
          <div className="p-3 bg-emerald-600 rounded-2xl text-white shadow-lg shadow-emerald-600/10">
            <Leaf className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-medium tracking-tight text-slate-900 dark:text-white mt-2">Welcome to EcoTrack</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Understand, track, and reduce your carbon footprint</p>
        </div>

        {/* Auth Box */}
        <Card className="border border-slate-200/50 dark:border-slate-800/80 shadow-md">
          <CardHeader className="text-center">
            <CardTitle>{isSignUp ? "Create Your Account" : "Sign In to Your Account"}</CardTitle>
            <CardDescription>
              {isSignUp 
                ? "Start your green journey with personalized suggestions" 
                : "Welcome back! Track your active streaks and check-ins"
              }
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-400 text-xs border border-amber-200/40 dark:border-amber-900/30 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-4">
              {isSignUp && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block tracking-wide">
                    Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="alex green"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block tracking-wide">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 block tracking-wide">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-600 text-slate-900 dark:text-white"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3"
                isLoading={loading}
              >
                {isSignUp ? "Sign Up" : "Sign In"}
              </Button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800" />
              </div>
              <span className="relative bg-white dark:bg-slate-900 px-3 text-xs text-slate-400 font-medium">
                Or continue with
              </span>
            </div>

            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white hover:bg-slate-50 dark:bg-slate-950 dark:hover:bg-slate-900 text-sm font-semibold flex items-center justify-center gap-2 text-slate-700 dark:text-slate-350 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all select-none hover-lift"
            >
              {/* Simple Google SVG Icon */}
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.54 14.98 1 12 1 7.35 1 3.39 3.67 1.5 7.56l3.86 3C6.27 7.74 8.92 5.04 12 5.04z"
                />
                <path
                  fill="#4285F4"
                  d="M23.49 12.27c0-.81-.07-1.59-.2-2.35H12v4.51h6.48c-.29 1.48-1.14 2.73-2.4 3.58l3.76 2.92c2.2-2.03 3.65-5.01 3.65-8.66z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.36 14.56c-.25-.74-.39-1.53-.39-2.56s.14-1.82.39-2.56L1.5 6.44C.54 8.36 0 10.5 0 13s.54 4.64 1.5 6.56l3.86-3z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.76-2.92c-1.04.7-2.38 1.11-4.2 1.11-3.08 0-5.73-2.7-6.64-5.52L1.5 16.76C3.39 20.33 7.35 23 12 23z"
                />
              </svg>
              Google
            </button>
          </CardContent>

          <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium select-none underline"
            >
              {isSignUp ? "Already have an account? Sign In" : "New to EcoTrack? Create an account"}
            </button>
          </CardFooter>
        </Card>

      </div>
    </main>
  );
}
