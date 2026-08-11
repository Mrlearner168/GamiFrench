import { useAuth } from '@/store/auth-context';
import { Slot, router } from 'expo-router';
import { useEffect } from 'react';

export default function GameLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    console.log('[GameLayout] auth state', {
      isLoading,
      hasSession: Boolean(session),
    });

    // If loading is finished and there is NO session, kick them to login
    if (isLoading || session) return;

    const redirectTimer = setTimeout(() => {
      console.log('[GameLayout] redirecting to login');
      router.replace('/(auth)/login');
    }, 0);

    return () => {
      console.log('[GameLayout] cancelling login redirect');
      clearTimeout(redirectTimer);
    };
  }, [session, isLoading]);

  console.log('[GameLayout] rendering Slot', { isLoading, hasSession: Boolean(session) });
  return <Slot />;
}