/**
 * Email service for sending emails
 * Uses Resend API to send emails
 * Falls back to console logging if RESEND_API_KEY is not configured
 */

import { Resend } from "resend";

class EmailService {
  private static instance: EmailService;
  private resend: Resend | null = null;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private isEmailConfigured(): boolean {
    return !!process.env.RESEND_API_KEY;
  }

  private getResendClient(): Resend {
    if (this.resend) {
      return this.resend;
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY is not configured");
    }

    this.resend = new Resend(apiKey);
    return this.resend;
  }

  public async sendVerificationEmail(
    email: string,
    code: string,
    firstName?: string,
  ): Promise<void> {
    try {
      if (!this.isEmailConfigured()) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 VERIFICATION EMAIL (Development Mode)");
        console.log("=".repeat(60));
        console.log(`To: ${email}`);
        console.log(`Name: ${firstName || "User"}`);
        console.log(`\n🔐 Verification Code: ${code}`);
        console.log(`⏱️  Expires in: 30 minutes`);
        console.log("=".repeat(60) + "\n");
        return;
      }

      const client = this.getResendClient();
      const appName = process.env.APP_NAME || "Participium";
      const emailFrom = process.env.EMAIL_FROM || "onboarding@resend.dev";

      const greeting = firstName ? `Hello ${firstName}` : "Hello";

      await client.emails.send({
        from: emailFrom,
        to: email,
        subject: `${appName} - Email Verification`,
        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <h2>Welcome to ${appName}!</h2>
            <p>${greeting},</p>
            <p>Thank you for registering. To complete your registration, please verify your email address using the code below:</p>
            
            <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
              <p style="font-size: 24px; font-weight: bold; letter-spacing: 2px; margin: 0;">${code}</p>
            </div>
            
            <p><strong>Important:</strong> This code will expire in 30 minutes. If you did not request this verification, please ignore this email.</p>
            
            <p>Best regards,<br/>The ${appName} Team</p>
          </div>
        `,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
}

export { EmailService };
