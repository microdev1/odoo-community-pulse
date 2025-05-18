import nodemailer from 'nodemailer';
import { Twilio } from 'twilio';
import { NotificationType } from '@prisma/client';

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
    return { success: false, error };
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
    return { success: false, error };
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

  let smsResult = { success: false, error: 'SMS not sent' };
  if (phone) {
    smsResult = await sendSmsNotification(phone, message);
  }

  return {
    email: emailResult,
    sms: smsResult,
  };
};
