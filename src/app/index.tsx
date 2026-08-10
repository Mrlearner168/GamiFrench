import { Redirect } from 'expo-router';

import { useAuth } from '@/store/auth-context';

export default function Index() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  return <Redirect href={session ? '/(game)/home' : '/(auth)/login'} />;
}