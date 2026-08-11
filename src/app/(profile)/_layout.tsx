import { Slot, router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '@/store/auth-context';

export default function ProfileLayout() {
  const { session, isLoading } = useAuth();

  useEffect(() => {
    console.log('[ProfileLayout] auth state', {
      isLoading,
      hasSession: Boolean(session),
    });

    if (isLoading || session) return;

    const redirectTimer = setTimeout(() => {
      console.log('[ProfileLayout] redirecting to login');
      router.replace('/(auth)/login');
    }, 0);

    return () => {
      console.log('[ProfileLayout] cancelling login redirect');
      clearTimeout(redirectTimer);
    };
  }, [session, isLoading]);

  console.log('[ProfileLayout] rendering Slot', { isLoading, hasSession: Boolean(session) });
  return <Slot />;
}
