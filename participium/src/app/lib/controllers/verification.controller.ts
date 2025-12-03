"use server";

import { VerificationService } from "@/services/verification.service";

/**
 * Server action to verify a user's email with a verification code
 */
export async function verifyRegistration(
  email: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (!code) {
    return {
      success: false,
      error: "Verification code is required",
    };
  }

  const verificationService = VerificationService.getInstance();

  return await verificationService.verifyRegistration(
    email.trim(),
    code.trim()
  );
}
