import { NextRequest } from 'next/server';
import { admin, firestore } from '@/lib/firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(request: NextRequest) {
  try {
    const { userId, token } = await request.json();

    if (!userId || !token) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Missing userId or token' 
        }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // Remove the token from the user's FCM tokens array in Firestore
    // Using arrayRemove to remove the specific token
    const userRef = firestore.collection('users').doc(userId);
    
    // Use FieldValue.arrayRemove to remove the token safely
    await userRef.update({
      fcmTokens: FieldValue.arrayRemove(token),
      updatedAt: new Date(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'FCM token removed successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error removing FCM token:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to remove FCM token',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}