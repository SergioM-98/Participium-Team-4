"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";

import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent } from "./ui/card";

import { verifyRegistration } from "../app/lib/controllers/verification.controller";

export default function VerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const email = searchParams.get("email") || "";

  const [code, setCode] = useState("");
  const [error, setError] = useState<string | undefined>("");
  const [validationError, setValidationError] = useState<
    Partial<Record<string, string>>
  >({});
  const [success, setSuccess] = useState<string | undefined>("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(undefined);
    setSuccess(undefined);
    setValidationError({});

    // Client-side validation
    const next: typeof validationError = {};
    if (!code.trim()) {
      next.code = "Verification code is required.";
    } else if (code.trim().length !== 6 || !/^\d+$/.test(code.trim())) {
      next.code = "Code must be 6 digits.";
    }
    setValidationError(next);
    if (Object.keys(next).length > 0) return;

    startTransition(async () => {
      try {
        const response = await verifyRegistration(email.trim(), code.trim());

        if (response.success) {
          setSuccess("Email verified successfully! Redirecting to login...");
          setTimeout(() => {
            router.push("/login");
          }, 2000);
        } else {
          setError(response.error);
        }
      } catch (err: any) {
        console.error(err);
        setError("Something went wrong. Please try again.");
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
        <Card className="w-full bg-background rounded-lg p-0 shadow-md">
          <CardContent className="p-0">
            <div className="p-6 pb-4">
              <h1 className="text-2xl font-bold text-foreground">
                Verify your email
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                We sent a 6-digit code to {email}. Enter it below to confirm
                your account.
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="px-6 pb-4 mt-2">
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="code">Verification Code</Label>
                    <Input
                      id="code"
                      name="code"
                      type="text"
                      placeholder="000000"
                      value={code}
                      onChange={(e) => {
                        setCode(e.target.value);
                        if (error) setError("");
                        if (validationError.code)
                          setValidationError((prev) => ({
                            ...prev,
                            code: undefined,
                          }));
                      }}
                      maxLength={6}
                      inputMode="numeric"
                      required
                      disabled={isPending}
                      aria-invalid={!!validationError.code}
                      aria-describedby="code-error"
                      className="text-center text-2xl tracking-widest font-mono"
                    />
                    {validationError.code && (
                      <p id="code-error" className="text-xs text-red-500 mt-1">
                        {validationError.code}
                      </p>
                    )}
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

                  <p className="text-xs text-muted-foreground mt-2">
                    The code will expire in 30 minutes. If you don&apos;t
                    receive it, check your spam folder or register again.
                  </p>
                </div>
              </div>

              <div className="px-6 py-4 flex justify-end items-center gap-2">
                <Button
                  type="submit"
                  className="h-9 px-4 text-sm font-medium w-full"
                  disabled={isPending}
                >
                  {isPending ? "Verifying..." : "Verify Code"}
                </Button>
              </div>
            </form>

            <div className="px-6 py-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                Having trouble?{" "}
                <button
                  onClick={() => router.push("/register")}
                  className="text-primary hover:underline font-medium"
                  disabled={isPending}
                >
                  Register again
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
