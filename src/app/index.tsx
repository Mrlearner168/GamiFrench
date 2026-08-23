import { Redirect } from 'expo-router';

import { useAuth } from '@/store/auth-context';

export default function Index() {
  const { session, isLoading } = useAuth();
  if (isLoading) return null;

  const destination = session
    ? session.user.onboardingComplete === false
      ? '/welcome'
      : '/(game)/home'
    : '/(auth)/login';

  return <Redirect href={destination} />;
}