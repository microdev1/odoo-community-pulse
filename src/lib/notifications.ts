import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import axios from 'axios';

// Define NotificationType to match the Prisma schema
export type NotificationType = 'EVENT_REMINDER' | 'EVENT_UPDATE' | 'EVENT_CANCELLATION';

// Email transporter setup
const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_SERVER_HOST,
  port: Number(process.env.EMAIL_SERVER_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
});

// Twilio client setup
const twilioClient = process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN
  ? new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// WhatsApp Business configuration
const whatsappConfig = {
  businessId: process.env.WHATSAPP_BUSINESS_ID,
  apiToken: process.env.WHATSAPP_API_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
};

// Send email notification
export const sendEmailNotification = async (email: string, subject: string, message: string) => {
  try {
    const info = await emailTransporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      subject: subject,
      text: message,
      html: `<div>${message}</div>`,
    });

    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email notification:', error);
    return { success: false, error: String(error) };
  }
};

// Send SMS notification
export const sendSmsNotification = async (phoneNumber: string, message: string) => {
  if (!twilioClient || !process.env.TWILIO_PHONE_NUMBER) {
    console.error('Twilio not configured properly');
    return { success: false, error: 'Twilio not configured' };
  }

  try {
    const smsMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber,
    });

    return { success: true, messageId: smsMessage.sid };
  } catch (error) {
    console.error('Error sending SMS notification:', error);
    return { success: false, error: String(error) };
  }
};

// Send WhatsApp notification
export const sendWhatsAppNotification = async (phoneNumber: string, message: string) => {
  if (!whatsappConfig.businessId || !whatsappConfig.apiToken || !whatsappConfig.phoneNumberId) {
    console.error('WhatsApp API not configured properly');
    return { success: false, error: 'WhatsApp API not configured' };
  }

  try {
    // Ensure phone number is in proper format (remove + if present)
    const formattedPhone = phoneNumber.replace(/^\+/, '');

    const response = await axios({
      method: 'POST',
      url: `https://graph.facebook.com/v17.0/${whatsappConfig.phoneNumberId}/messages`,
      headers: {
        'Authorization': `Bearer ${whatsappConfig.apiToken}`,
        'Content-Type': 'application/json',
      },
      data: {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: formattedPhone,
        type: 'text',
        text: {
          preview_url: false,
          body: message
        }
      }
    });

    return { success: true, messageId: response.data.messages?.[0]?.id || 'sent' };
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return { success: false, error: String(error) };
  }
};

// Handle notifications based on type
export const sendNotification = async (
  email: string,
  phone: string | null,
  message: string,
  subject: string,
  type: NotificationType
) => {
  const emailResult = await sendEmailNotification(email, subject, message);

  let smsResult: { success: boolean; messageId?: string; error?: string } = {
    success: false,
    error: 'SMS not sent'
  };

  let whatsappResult: { success: boolean; messageId?: string; error?: string } = {
    success: false,
    error: 'WhatsApp not sent'
  };

  if (phone) {
    // Send SMS
    smsResult = await sendSmsNotification(phone, message);

    // Send WhatsApp
    whatsappResult = await sendWhatsAppNotification(phone, message);
  }

  return {
    email: emailResult,
    sms: smsResult,
    whatsapp: whatsappResult
  };
};
