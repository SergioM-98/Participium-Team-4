"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation"; // Import useRouter
import { motion } from "framer-motion";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

import { Eye, EyeOff } from "lucide-react";

// Import your server action
// Changed relative path to use the root alias, which might resolve the build error.
import { register } from "@/app/lib/controllers/user.controller";

export default function RegisterForm() {
  const router = useRouter(); // Hook for navigation
  const [isPending, startTransition] = useTransition(); // Hook for loading state

  // State for form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // State for server errors
  const [error, setError] = useState<string | undefined>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default browser submission
    setError(undefined); // Clear any previous errors

    // Create FormData to pass to the server action
    const formData = new FormData();
    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("email", email);
    formData.append("username", username);
    formData.append("password", password);
    formData.append("confirmPassword", confirmPassword);
    formData.append("role", "CITIZEN");

    // Use startTransition to call the server action
    // This marks the update as a transition and sets isPending to true
    startTransition(async () => {
      const response = await register(formData);
      if (!response.success) {
        setError(response.error);
      } else {
        // For CITIZEN users, redirect to verification page
        if (response.pendingVerification) {
          router.push(`/verify?email=${encodeURIComponent(email)}`);
        } else {
          // For other roles, redirect to login
          router.push("/login?registered=true");
        }
      }
    });
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tighter">
              Create an account
            </h1>
            <p className="text-muted-foreground">
              Get started by filling out the form below.
            </p>
          </div>
          {/* Bind the handleSubmit function to the form's onSubmit event */}
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="John"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                  disabled={isPending} // Disable input when pending
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Doe"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  required
                  disabled={isPending}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe123"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isPending}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
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

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                  disabled={isPending}
                >
                  {showConfirmPassword ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>
              </div>
            </div>

            {/* Display server error message if it exists */}
            {error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative text-sm"
                role="alert"
              >
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={isPending}>
              {/* Show different text based on pending state */}
              {isPending ? "Creating account..." : "Create account"}
            </Button>
          </form>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Already have an account?
              </span>
            </div>
          </div>
          <Button asChild type="button" variant="outline" className="w-full">
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
