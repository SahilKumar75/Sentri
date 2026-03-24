export type ContactMethod = 'phone' | 'email';

export type UserProfile = {
  id?: number;
  firstName: string;
  lastName: string;
  dob: string;
  phone?: string;
  email?: string;
  password?: string;
  verifiedPhone: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
};

export type PendingSignup = {
  pendingUserId: number;
  contactMethod: ContactMethod;
  phone?: string;
  otpCode?: string;
};
