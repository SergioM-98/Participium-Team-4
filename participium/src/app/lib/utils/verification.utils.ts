/**
 * Verification utilities for email-based registration confirmation
 */

import { randomInt } from "node:crypto";

/**
 * Generates a cryptographically secure 6-digit random verification code
 */
export function generateVerificationCode(): string {
  return randomInt(100000, 1000000).toString();
}

/**
 * Calculates the expiration time (30 minutes from now)
 */
export function getVerificationTokenExpiry(): Date {
  return new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
}

/**
 * Checks if a verification token is expired
 */
export function isTokenExpired(expiresAt: Date): boolean {
  return expiresAt < new Date();
}
