"use client";

import { use, useState, useTransition } from "react";
import { motion } from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  // Check for a success message from registration
  const [success, setSuccess] = useState<string | undefined>(
    searchParams.get("registered")
      ? "Registration successful! Please log in."
      : ""
  );


  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);

    const formData = new FormData(event.currentTarget);
    const username = formData.get("username")?.toString();
    const password = formData.get("password")?.toString();

    console.log(username);
    console.log(password);
    if (!username || !password) {
      setError("All fields are required");
      return;
    }

    startTransition(async () => {
      try {
        const response = await signIn("credentials", {
          redirect: false,
          username,
          password,
        });

        if (!response || response.error) {
          setError(response?.error || "Invalid credentials");
        } else {
          // Login riuscito: fai redirect
          router.push("/dashboard");
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
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Welcome back!
            </h1>
            <p className="text-muted-foreground">
              Please enter your credentials to continue.
            </p>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="username">username</Label>
              <Input
                id="username"
                name="username"
                type="username"
                placeholder="you@example.com"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                required
                disabled={isPending}
              />
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
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
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
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" disabled={isPending} />
                <Label htmlFor="remember">Remember me</Label>
              </div>
            </div>

            {/* Display server error message */}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Display success message (e.g., from registration) */}
            {success && (
              <div
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative text-sm"
                role="alert"
              >
                <span className="block sm:inline">{success}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Don't have an account?
              </span>
            </div>
          </div>
          <Link href="/register" className="w-full">
            <Button type="button" className="w-full">
              Sign up
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
