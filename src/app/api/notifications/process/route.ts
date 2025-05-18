import { supabaseAdmin } from '@/lib/supabase';
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
    const { data: pendingNotifications, error: notifError } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('isSent', false)
      .limit(100); // Process in batches
      
    if (notifError) {
      throw notifError;
    }
    
    if (!pendingNotifications || pendingNotifications.length === 0) {
      return NextResponse.json({
        success: true,
        processed: 0,
        successful: 0,
      });
    }

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
        const { error: updateError } = await supabaseAdmin
          .from('notifications')
          .update({
            isSent: true,
            updatedAt: new Date().toISOString()
          })
          .eq('id', notification.id);
          
        if (updateError) {
          throw updateError;
        }

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
