import type { ContactMethod, UserProfile } from '../types/auth';
import { API_BASE_URL, extractErrorMessage, getNetworkMessage, requestJson } from './http-client';

type AuthResult = {
  ok: boolean;
  message: string;
  requiresOtp?: boolean;
  pendingUserId?: number;
  otpCode?: string;
  sessionToken?: string;
  user?: UserProfile;
};

type BackendUser = {
  id: number;
  firstName: string;
  lastName: string;
  dob: string;
  phone?: string | null;
  email?: string | null;
  verifiedPhone: boolean;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
};

type BackendAuthResult = {
  message: string;
  requiresOtp: boolean;
  pendingUserId?: number | null;
  debugOtpCode?: string | null;
  sessionToken?: string | null;
  user?: BackendUser | null;
};

export async function signup(payload: {
  profile: UserProfile;
  contactMethod: ContactMethod;
}): Promise<AuthResult> {
  return postAuth('/auth/signup', {
    firstName: payload.profile.firstName,
    lastName: payload.profile.lastName,
    dob: payload.profile.dob,
    phone: payload.profile.phone,
    email: payload.profile.email,
    password: payload.profile.password,
    contactMethod: payload.contactMethod,
  });
}

export async function verifyOtp(payload: {
  pendingUserId: number;
  otpCode: string;
}): Promise<AuthResult> {
  return postAuth('/auth/verify-otp', payload);
}

export async function login(payload: {
  identifier: string;
  password: string;
}): Promise<AuthResult> {
  return postAuth('/auth/login', payload);
}

export async function restoreSession(sessionToken: string): Promise<AuthResult> {
  try {
    const response = await requestJson<BackendAuthResult>('/auth/session', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(response.error, 'Session restore failed.') };
    }
    return mapAuthResult(response.data);
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

export async function logout(sessionToken: string) {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
  } catch {
    // Best effort.
  }
}

async function postAuth(path: string, payload: object): Promise<AuthResult> {
  try {
    const response = await requestJson<BackendAuthResult>(path, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(response.error, 'Request failed.') };
    }
    return mapAuthResult(response.data);
  } catch (error) {
    return { ok: false, message: getNetworkMessage(error) };
  }
}

function mapAuthResult(data: BackendAuthResult): AuthResult {
  return {
    ok: true,
    message: data.message,
    requiresOtp: data.requiresOtp,
    pendingUserId: data.pendingUserId ?? undefined,
    otpCode: data.debugOtpCode ?? undefined,
    sessionToken: data.sessionToken ?? undefined,
    user: data.user ? mapUser(data.user) : undefined,
  };
}

function mapUser(user: BackendUser): UserProfile {
  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    dob: formatDob(user.dob),
    phone: user.phone ?? undefined,
    email: user.email ?? undefined,
    verifiedPhone: user.verifiedPhone,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    lastLoginAt: user.lastLoginAt ?? undefined,
  };
}

function formatDob(dob: string) {
  if (!dob.includes('-')) {
    return dob;
  }
  const [year, month, day] = dob.split('-');
  return `${day}/${month}/${year}`;
}
