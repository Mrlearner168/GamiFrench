import { Redirect } from 'expo-router';

import { StartupLoader } from '@/components/startup-loader';
import { useAppWarmup } from '@/hooks/use-app-warmup';
import { useAuth } from '@/store/auth-context';

/*
 * App entry. On first open it shows the warm-up loader (session, French voice,
 * saved progress, server status) instead of a blank screen, then sends the
 * learner to the right place.
 */
export default function Index() {
  const { session } = useAuth();
  const { steps, ready } = useAppWarmup();

  if (!ready) return <StartupLoader steps={steps} />;

  const destination = session
    ? session.user.onboardingComplete === false
      ? '/welcome'
      : '/(game)/home'
    : '/(auth)/login';

  return <Redirect href={destination} />;
}
