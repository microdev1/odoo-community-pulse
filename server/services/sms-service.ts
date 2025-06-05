"use server";

// SMS provider implementation
// This is a simple implementation that can be replaced with a more robust solution
// like Twilio, MessageBird, etc.

interface SMSOptions {
  to: string;
  message: string;
}

export class SMSService {
  static async sendSMS(
    options: SMSOptions
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // In a real implementation, you would use a proper SMS service API here
      // For now, we'll just log the message and simulate success
      console.log(
        `[SMS Service] Sending SMS to ${options.to}: ${options.message}`
      );

      // Simulating an API call to an SMS provider
      if (process.env.SMS_SERVICE_API_KEY) {
        console.log(
          `Using SMS API key: ${process.env.SMS_SERVICE_API_KEY.substring(0, 3)}...`
        );
        // In a real implementation, you would make an HTTP request to your SMS provider
      }

      return { success: true };
    } catch (error) {
      console.error("Error sending SMS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  // Helper method to format event reminder SMS
  static formatEventReminderSMS(event: {
    title: string;
    date: string;
    location: string;
  }): string {
    const date = new Date(event.date).toLocaleString();
    return `Reminder: "${event.title}" is happening tomorrow at ${date}, ${event.location}. We look forward to seeing you!`;
  }

  // Helper method to format event update SMS
  static formatEventUpdateSMS(
    event: { title: string },
    updateMessage: string
  ): string {
    return `Update for event "${event.title}": ${updateMessage}`;
  }

  // Helper method to format event cancellation SMS
  static formatEventCancellationSMS(event: { title: string }): string {
    return `The event "${event.title}" has been cancelled. We apologize for any inconvenience.`;
  }
}
