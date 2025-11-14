"use client";

import { use, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { Eye, EyeOff } from "lucide-react";
import { signIn } from "next-auth/react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [username, setusername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // State for server errors
  const [error, setError] = useState<string | undefined>("");
  
  const [validationError, setValidationError] = useState<Partial<Record<string, string>>>({});
  // Check for a success message from registration
  const [success, setSuccess] = useState<string | undefined>(
    searchParams.get("registered")
      ? "Registration successful! Please log in."
      : ""
  );


  const getErrorMessage = (error: string) => {
    switch (error) {
      case "CredentialsSignin":
        return "Wrong credentials"; 
      case "Configuration":
        return "Server configuration error";
      case "AccessDenied":
        return "Access denied";
      case "Verification":
        return "Verification error";
      default:
        return "An error occurred during login";
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setValidationError({});

    // Client-side validation
    const next: typeof validationError = {};
    if (!username.trim()) next.username = "Username is required.";
    if (!password) next.password = "Password is required.";
    setValidationError(next);
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      try {
        const response = await signIn("credentials", {
          redirect: false,
          username,
          password,
        });

        if (!response || response.error) {
          const errorMessage = response?.error ? getErrorMessage(response.error) : "Invalid credentials";
          setError(errorMessage);
        } else {
          setTimeout(() => {
            window.location.href = "/";
          }, 100);
        }
      } catch (err: any) {
        console.error(err);
        setError("Something went wrong. Please try again.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="w-full bg-background rounded-lg p-0 shadow-md">
          <CardContent className="p-0">
            <div className="p-6 pb-4">
              <h1 className="text-2xl font-bold text-foreground">Welcome back!</h1>
              <p className="text-sm text-muted-foreground mt-1">Please enter your credentials to continue.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 pb-4 mt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="admin"
                      value={username}
                      onChange={(e) => {
                        setusername(e.target.value);
                        if (error) setError("");
                        if (validationError.username) setValidationError((prev) => ({ ...prev, username: undefined }));
                      }}
                      required
                      disabled={isPending}
                      aria-invalid={!!validationError.username}
                      aria-describedby="username-error"
                    />
                    {validationError.username && <p id="username-error" className="text-xs text-red-500 mt-1">{validationError.username}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (error) setError("");
                          if (validationError.password) setValidationError((prev) => ({ ...prev, password: undefined }));
                        }}
                        required
                        disabled={isPending}
                        aria-invalid={!!validationError.password}
                        aria-describedby="password-error"
                      />
                      {validationError.password && <p id="password-error" className="text-xs text-red-500 mt-1">{validationError.password}</p>}
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        disabled={isPending}
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 flex justify-end items-center gap-2">
                <Button type="submit" className="h-9 px-4 text-sm font-medium w-full" disabled={isPending}>
                  {isPending ? "Signing in..." : "Sign in"}
                </Button>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-border">
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Don&apos;t have an account?
                  </span>
                </div>
              </div>
              <Link href="/register" className="w-full block">
                <Button type="button" className="w-full" variant="outline">
                  Sign up
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
