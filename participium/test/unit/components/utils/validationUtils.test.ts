import { validateEmail } from "@/components/profile/utils/validationUtils";

describe("validationUtils", () => {
  describe("validateEmail", () => {
    it("should validate correct email addresses", () => {
      const validEmails = [
        "test@example.com",
        "user.name@example.com",
        "user+tag@example.com",
        "user_name@example.co.uk",
        "user123@test-domain.com",
      ];

      validEmails.forEach((email) => {
        const result = validateEmail(email);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeNull();
      });
    });

    it("should return error for empty email", () => {
      const result = validateEmail("");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required.");
    });

    it("should return error for whitespace-only email", () => {
      const result = validateEmail("   ");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Email is required.");
    });

    it("should return error for email without @", () => {
      const result = validateEmail("invalidemail.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("should return error for email without domain", () => {
      const result = validateEmail("user@");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("should return error for email without local part", () => {
      const result = validateEmail("@example.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("should return error for email without extension", () => {
      const result = validateEmail("user@example");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("should return error for email with spaces", () => {
      const result = validateEmail("user name@example.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("should return error for multiple @ symbols", () => {
      const result = validateEmail("user@@example.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });

    it("should return error for domain starting with dot", () => {
      const result = validateEmail("user@.example.com");
      expect(result.isValid).toBe(false);
      expect(result.error).toBe("Please enter a valid email address.");
    });
  });
});
