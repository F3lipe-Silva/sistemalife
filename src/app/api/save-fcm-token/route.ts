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

    // Add the token to the user's FCM tokens array in Firestore
    // Using arrayUnion to avoid duplicates
    const userRef = firestore.collection('users').doc(userId);
    
    // Check if user document exists, if not, create it
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      await userRef.set({
        fcmTokens: [token],
        createdAt: new Date(),
      });
    } else {
      // Use FieldValue.arrayUnion to avoid duplicates
      await userRef.update({
        fcmTokens: FieldValue.arrayUnion(token),
        updatedAt: new Date(),
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'FCM token saved successfully' 
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error saving FCM token:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to save FCM token',
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}