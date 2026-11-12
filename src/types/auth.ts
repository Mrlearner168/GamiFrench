export type UserProfile = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username?: string;
  frenchLevel: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  gender: 'male' | 'female';
  onboardingComplete: boolean;
  /**
   * Server-side role. Surfaced by ``GET /api/v1/auth/me`` so settings screens
   * can branch on ``role === 'teacher'`` without a separate fetch. Optional
   * for compatibility with pre-existing stored sessions.
   */
  role?: 'student' | 'teacher' | 'admin';
  /**
   * Shareable class code auto-assigned to teachers. Learners type this into
   * the register form's "Teacher code" field; admins also see it in the
   * dashboard. ``null`` for student/admin accounts (the DB column is also
   * gated by ``ck_users_teacher_code_only_for_teachers``).
   */
  teacherCode?: string | null;
  /** Teacher this learner is assigned to. ``null`` for unassigned learners
   * and for teachers/admins themselves. */
  teacherId?: string | null;
  /** Display name of the assigned teacher, ready to render. */
  teacherName?: string | null;
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
  /** Optional: teacher email or teacher code to assign this learner to a class. */
  teacherEmail?: string;
  teacherCode?: string;
};
