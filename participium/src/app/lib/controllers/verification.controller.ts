"use server";

import { VerificationService } from "../services/verification.service";

/**
 * Server action to verify a user's email with a verification code
 */
export async function verifyRegistration(
  emailOrUsername: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  if (!emailOrUsername || !code) {
    return {
      success: false,
      error: "Email/username and verification code are required",
    };
  }

  return await VerificationService.getInstance().verifyRegistration(
    emailOrUsername,
    code
  );
}
