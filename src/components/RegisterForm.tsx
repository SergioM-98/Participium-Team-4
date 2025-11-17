"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

import { Eye, EyeOff } from "lucide-react";

import { UserController } from "@/app/lib/controllers/user.controller";

export default function RegisterForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
  // State for client-side validation errors
  const [validationError, setValidationError] = useState<Partial<Record<string, string>>>({});

  // Client-side validation
  const validate = () => {
    const next: typeof validationError = {};
    if (!firstName.trim()) next.firstName = "First name is required.";
    if (!lastName.trim()) next.lastName = "Last name is required.";
    if (!email.trim()) {
      next.email = "Email is required.";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      next.email = "Invalid email address.";
    }
    if (!username.trim()) {
      next.username = "Username is required.";
    } else if (!/^[a-zA-Z0-9._-]{3,}$/.test(username)) {
      next.username = "Username must be at least 3 characters and contain only letters, numbers, dots, underscores, or hyphens.";
    }
    if (!password) {
      next.password = "Password is required.";
    } else if (password.length < 8) {
      next.password = "Password must be at least 8 characters long.";
    }
    if (!confirmPassword) {
      next.confirmPassword = "Confirm password is required.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = "Passwords do not match. Please verify both passwords are identical.";
    }
    setValidationError(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); // Prevent default browser submission
    setError(undefined); // Clear any previous errors

  if (!validate()) return;

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
    startTransition(async () => {
      const response = await new UserController().register(formData);
      if (!response.success) {
        setError(response.error);
      } else {
        router.push("/login?registered=true");
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
              <h1 className="text-2xl font-bold text-foreground">Create an account</h1>
              <p className="text-sm text-muted-foreground mt-1">Get started by filling out the form below.</p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 pb-4 mt-2">
                <div className="grid grid-cols-1 gap-4">
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
                        disabled={isPending}
                        aria-invalid={!!validationError.firstName}
                        aria-describedby="firstName-error"
                      />
                        {validationError.firstName && <p id="firstName-error" className="text-xs text-red-500 mt-1">{validationError.firstName}</p>}
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
                        aria-invalid={!!validationError.lastName}
                        aria-describedby="lastName-error"
                      />
                        {validationError.lastName && <p id="lastName-error" className="text-xs text-red-500 mt-1">{validationError.lastName}</p>}
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
                      aria-invalid={!!validationError.email}
                      aria-describedby="email-error"
                    />
                      {validationError.email && <p id="email-error" className="text-xs text-red-500 mt-1">{validationError.email}</p>}
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
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                  aria-invalid={!!validationError.confirmPassword}
                  aria-describedby="confirmPassword-error"
                />
                {validationError.confirmPassword && <p id="confirmPassword-error" className="text-xs text-red-500 mt-1">{validationError.confirmPassword}</p>}
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

                  {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                </div>
              </div>

              <div className="px-6 py-4 flex justify-end items-center gap-2">
                <Button type="submit" className="h-9 px-4 text-sm font-medium w-full" disabled={isPending}>
                  {isPending ? "Creating account..." : "Create account"}
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
                    Already have an account?
                  </span>
                </div>
              </div>
              <Button asChild type="button" variant="outline" className="w-full">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
