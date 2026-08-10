import { Redirect, Stack } from 'expo-router';

import { useAuth } from '@/store/auth-context';

export default function GameLayout() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;
  if (!session) return <Redirect href="/(auth)/login" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}
