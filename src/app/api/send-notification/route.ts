import { NextRequest } from 'next/server';
import { getMessaging } from 'firebase-admin/messaging';
import { admin, firestore } from '@/lib/firebase-admin';

// Initialize Firebase Admin Messaging
let messaging: any = null;
try {
  messaging = getMessaging(admin);
} catch (error) {
  console.error('Firebase Admin Messaging not available:', error);
}

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();
    const { userId, title, body: messageBody, data } = body;

    if (!userId || !title || !messageBody) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing required fields: userId, title, or body' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Fetch user's FCM tokens from Firestore
    const userDocRef = firestore.collection('users').doc(userId);
    const userDoc = await userDocRef.get();
    const userData = userDoc.data();
    const fcmTokens = userData?.fcmTokens || [];
    
    if (fcmTokens.length === 0) {
      console.warn(`No FCM tokens found for user ${userId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'No FCM tokens found for user',
          warning: 'User has not registered any devices for notifications'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Send notification to all tokens
    const message = {
      notification: {
        title,
        body: messageBody,
      },
      data: {
        ...data,
        userId, // Include userId in data for tracking
        timestamp: new Date().toISOString(),
        click_action: 'FLUTTER_NOTIFICATION_CLICK', // For mobile apps
      },
      tokens: fcmTokens,
    };
    
    if (!messaging) {
      throw new Error('Firebase Messaging is not available');
    }
    
    const response = await messaging.sendMulticast(message);
    
    // Remove invalid tokens
    if (response.failureCount > 0) {
      const failedTokens: string[] = [];
      response.responses.forEach((resp: any, idx: number) => {
        if (!resp.success) {
          // Common reasons for failure include:
          // - Token is invalid (unregistered)
          // - Token belongs to an app that has been uninstalled
          if (resp.error?.code === 'messaging/invalid-registration-token' ||
              resp.error?.code === 'messaging/registration-token-not-registered') {
            failedTokens.push(fcmTokens[idx]);
          }
        }
      });
      
      if (failedTokens.length > 0) {
        // Remove failed tokens from user's profile
        const updatedTokens = fcmTokens.filter((token: string) => !failedTokens.includes(token));
        await userDocRef.update({
          fcmTokens: updatedTokens
        });
        
        console.log(`Removed ${failedTokens.length} invalid tokens for user ${userId}`);
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Notifications sent successfully',
        successCount: response.successCount,
        failureCount: response.failureCount,
        totalTokens: fcmTokens.length
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error: any) {
    console.error('Error sending notification:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to send notification',
        error: error instanceof Error ? error.message : 'Unknown error',
        ...(process.env.NODE_ENV === 'development' && { stack: error?.stack })
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}