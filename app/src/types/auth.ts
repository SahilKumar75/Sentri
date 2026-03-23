export type ContactMethod = 'phone' | 'email';

export type UserProfile = {
  firstName: string;
  lastName: string;
  dob: string;
  phone?: string;
  email?: string;
  password: string;
  verifiedPhone: boolean;
};

export type PendingSignup = {
  profile: UserProfile;
  contactMethod: ContactMethod;
  otpCode?: string;
};
