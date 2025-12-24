/**
 * Validation utilities
 */

export const validateEmail = (
  email: string,
): { isValid: boolean; error: string | null } => {
  if (!email.trim()) {
    return {
      isValid: false,
      error: "Email is required.",
    };
  }

  const emailRegex = /^[^@\s]+@[^@\s.]+\.[^@\s]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: "Please enter a valid email address.",
    };
  }

  return {
    isValid: true,
    error: null,
  };
};
