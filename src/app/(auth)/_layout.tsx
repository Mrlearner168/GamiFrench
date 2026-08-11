import { useAuth } from '@/store/auth-context';
import { Stack, router } from 'expo-router';
import { useEffect } from 'react';

// 🚨 Extracted OUTSIDE the component to prevent React Native 
// from deep-freezing the object and crashing the navigation refs.
const STACK_OPTIONS = {
  headerShown: false,
  animation: 'slide_from_right' as const,
  contentStyle: { backgroundColor: '#F5F7FA' },
};

export default function AuthLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    console.log('[AuthLayout] auth state', {
      isLoading,
      hasSession: Boolean(session),
    });

    // If still loading or there is NO session, stay on the Auth screens
    if (isLoading || !session) return;

    // If we have a session, safely redirect to the game
    const redirectTimer = setTimeout(() => {
      console.log('[AuthLayout] redirecting to home');
      router.replace('/(game)/home');
    }, 0);

    return () => {
      console.log('[AuthLayout] cancelling home redirect');
      clearTimeout(redirectTimer);
    };
  }, [session, isLoading]);

  console.log('[AuthLayout] rendering Stack', { isLoading, hasSession: Boolean(session) });
  
  // Pass the external constant instead of an inline object
  return <Stack screenOptions={STACK_OPTIONS} />;
}