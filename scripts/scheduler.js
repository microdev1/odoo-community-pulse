#!/usr/bin/env node

/**
 * scheduler.js
 *
 * This script sets up and runs scheduled tasks for the Community Pulse app:
 * 1. Daily at 8am: Create reminders for tomorrow's events
 * 2. Every 10 minutes: Process pending notifications and send them
 */
const axios = require('axios');
const cron = require('node-cron');
require('dotenv').config();

// Load environment variables
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';
const SECRET_TOKEN = process.env.NOTIFICATION_SECRET_TOKEN;

if (!SECRET_TOKEN) {
  console.error('Missing NOTIFICATION_SECRET_TOKEN in environment variables');
  process.exit(1);
}

// Schedule daily reminders creation (8:00 AM every day)
cron.schedule('0 8 * * *', async () => {
  console.log('Creating event reminders...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/notifications/reminders?token=${SECRET_TOKEN}`
    );

    console.log('Event reminders created:', response.data);
  } catch (error) {
    console.error('Error creating reminders:', error.response?.data || error.message);
  }
});

// Schedule notification processing (every 10 minutes)
cron.schedule('*/10 * * * *', async () => {
  console.log('Processing pending notifications...');
  try {
    const response = await axios.post(
      `${BASE_URL}/api/notifications/process?token=${SECRET_TOKEN}`
    );

    console.log('Notifications processed:', response.data);
  } catch (error) {
    console.error('Error processing notifications:', error.response?.data || error.message);
  }
});

console.log('Community Pulse Scheduler started');
console.log('- Creating event reminders daily at 8:00 AM');
console.log('- Processing notifications every 10 minutes');
