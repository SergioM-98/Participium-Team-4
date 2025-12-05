import nodemailer from "nodemailer";
import path from "path";

class EmailService {
  private static instance: EmailService;
  private transporter: nodemailer.Transporter | null = null;

  private constructor() {}

  public static getInstance(): EmailService {
    if (!EmailService.instance) {
      EmailService.instance = new EmailService();
    }
    return EmailService.instance;
  }

  private isEmailConfigured(): boolean {
    return !!(
      process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS
    );
  }

  private async getTransporter(): Promise<nodemailer.Transporter> {
    if (this.transporter) {
      return this.transporter;
    }

    if (this.isEmailConfigured()) {
      this.transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || "587"),
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    } else {
      // Use Ethereal Email for development
      const testAccount = await nodemailer.createTestAccount();
      this.transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }

    return this.transporter;
  }

  public async sendVerificationEmail(
    email: string,
    code: string,
    firstName?: string,
  ): Promise<void> {
    try {
      const transporter = await this.getTransporter();
      const appName = process.env.APP_NAME || "Participium";
      const emailFrom = process.env.EMAIL_FROM || "noreply@participium.local";

      const greeting = firstName ? `Hello ${firstName}` : "Hello";

      const mailOptions = {
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
      };

      const info = await transporter.sendMail(mailOptions);

      if (!this.isEmailConfigured()) {
        console.log("\n" + "=".repeat(60));
        console.log("📧 VERIFICATION EMAIL (Development Mode - Ethereal)");
        console.log("=".repeat(60));
        console.log(`To: ${email}`);
        console.log(`Name: ${firstName || "User"}`);
        console.log(`\n🔐 Verification Code: ${code}`);
        console.log(`⏱️  Expires in: 30 minutes`);
        console.log(`\n📨 Preview URL: ${nodemailer.getTestMessageUrl(info)}`);
        console.log("=".repeat(60) + "\n");
      }
    } catch (error) {
      console.error("Failed to send verification email:", error);
      throw new Error("Failed to send verification email");
    }
  }
}

export { EmailService };
