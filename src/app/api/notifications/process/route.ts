import { prisma } from '@/lib/prisma';
import { NextRequest, NextResponse } from 'next/server';
import { sendNotification } from '@/lib/notifications';

/**
 * API endpoint to process pending notifications
 * This should be called by a scheduled job (e.g., cron) to process and send notifications
 */
export async function POST(request: NextRequest) {
  try {
    // For security, check for a secret token
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    // Verify the token matches our secret
    if (token !== process.env.NOTIFICATION_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get current date/time
    const now = new Date();

    // Get pending notifications
    const pendingNotifications = await prisma.notification.findMany({
      where: {
        isSent: false,
      },
      take: 100, // Process in batches
    });

    let processedCount = 0;
    let successCount = 0;

    // Process each notification
    for (const notification of pendingNotifications) {
      processedCount++;

      try {
        // Send the notification
        const result = await sendNotification(
          notification.email,
          notification.phone || null,
          notification.message,
          'Community Pulse Notification',
          notification.type
        );

        // Update notification as sent
        await prisma.notification.update({
          where: {
            id: notification.id,
          },
          data: {
            isSent: true,
          },
        });

        if (result.email.success || result.sms.success || result.whatsapp.success) {
          successCount++;
        }
      } catch (error) {
        console.error(`Error processing notification ${notification.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedCount,
      successful: successCount,
    });

  } catch (error) {
    console.error('Error processing notifications:', error);
    return NextResponse.json({ error: 'Failed to process notifications' }, { status: 500 });
  }
}
