export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  frenchLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  gender: 'male' | 'female';
  onboardingComplete: boolean;
};

export type AuthSession = {
  accessToken: string;
  refreshToken?: string;
  user: UserProfile;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type RegistrationInput = AuthCredentials & {
  firstName: string;
  lastName: string;
  username?: string;
  confirmPassword: string;
  gender: 'male' | 'female';
};
