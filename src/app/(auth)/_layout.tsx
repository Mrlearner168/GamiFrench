import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/store/auth-context';

export default function AuthLayout() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  if (session) return <Redirect href="/(game)/home" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
