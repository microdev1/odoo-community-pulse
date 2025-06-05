"use server";

// Email provider implementation
// This is a simple implementation that can be replaced with a more robust solution
// like SendGrid, Mailgun, etc.

import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

export class EmailService {
  private static transporter = nodemailer.createTransport({
    // For development, use a test account
    // For production, use actual SMTP credentials
    host: process.env.EMAIL_HOST || "smtp.ethereal.email",
    port: parseInt(process.env.EMAIL_PORT || "587"),
    secure: process.env.EMAIL_SECURE === "true",
    auth: {
      user: process.env.EMAIL_USER || "",
      pass: process.env.EMAIL_PASSWORD || "",
    },
  });

  static async sendEmail(
    options: EmailOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const from = process.env.EMAIL_FROM || "notifications@communitypulse.com";

      const mailOptions = {
        from,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html || options.text,
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log(`Email sent: ${info.messageId}`);

      return { success: true };
    } catch (error) {
      console.error("Error sending email:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Helper method to generate HTML for event reminder
  static generateEventReminderHTML(event: {
    title: string;
    date: string;
    location: string;
    description: string;
  }) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Event Reminder</h1>
        <h2 style="color: #1f2937;">${event.title}</h2>
        <p>Your event is happening tomorrow!</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
          <p><strong>Description:</strong> ${event.description}</p>
        </div>
        <p style="margin-top: 20px;">We look forward to seeing you there!</p>
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          This is an automated message from Community Pulse.
          Please do not reply to this email.
        </p>
      </div>
    `;
  }

  // Helper method to generate HTML for event update
  static generateEventUpdateHTML(
    event: { title: string; date: string; location: string },
    updateMessage: string
  ) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3b82f6;">Event Update</h1>
        <h2 style="color: #1f2937;">${event.title}</h2>
        <p><strong>Important Update:</strong> ${updateMessage}</p>
        <div style="background-color: #f3f4f6; padding: 15px; border-radius: 5px; margin-top: 20px;">
          <p><strong>Date:</strong> ${new Date(event.date).toLocaleString()}</p>
          <p><strong>Location:</strong> ${event.location}</p>
        </div>
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          This is an automated message from Community Pulse.
          Please do not reply to this email.
        </p>
      </div>
    `;
  }

  // Helper method to generate HTML for event cancellation
  static generateEventCancellationHTML(event: { title: string; date: string }) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #ef4444;">Event Cancelled</h1>
        <h2 style="color: #1f2937;">${event.title}</h2>
        <p>We regret to inform you that the event has been cancelled.</p>
        <p>The event was originally scheduled for ${new Date(event.date).toLocaleString()}.</p>
        <p style="margin-top: 20px;">We apologize for any inconvenience this may cause.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #6b7280;">
          This is an automated message from Community Pulse.
          Please do not reply to this email.
        </p>
      </div>
    `;
  }
}
