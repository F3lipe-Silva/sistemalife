'use client';

import { useState, useEffect } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

export default function TestAuthPage() {
  const { data: session, status } = useSession();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      console.log('User is not authenticated');
    }
  }, [status]);

  const handleSignIn = async () => {
    try {
      const result = await signIn('credentials', {
        email: 'test@example.com',
        password: 'password',
        redirect: false,
      });
      console.log('Sign in result:', result);
    } catch (err) {
      setError('Sign in failed: ' + (err as Error).message);
      console.error('Sign in error:', err);
    }
  };

  return (
    <div className="p-8">
      <h1>Auth Test Page</h1>
      <p>Session status: {status}</p>
      {session && <pre>{JSON.stringify(session, null, 2)}</pre>}
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      
      {!session && (
        <button onClick={handleSignIn} className="mr-4 p-2 bg-blue-500 text-white">
          Sign In with Credentials
        </button>
      )}
      
      {session && (
        <button onClick={() => signOut()} className="p-2 bg-red-500 text-white">
          Sign Out
        </button>
      )}
    </div>
  );
}