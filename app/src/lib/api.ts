import { NativeModules, Platform } from 'react-native';
import type { ContactMethod, UserProfile } from '../types/auth';

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

export const API_BASE_URL = detectApiBaseUrl();

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
    const response = await fetch(`${API_BASE_URL}/auth/session`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sessionToken}`,
      },
    });
    const data = (await response.json()) as BackendAuthResult | { message?: string; details?: string[] };
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(data, 'Session restore failed.') };
    }
    return mapAuthResult(data as BackendAuthResult);
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
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    const data = (await response.json()) as BackendAuthResult | { message?: string; details?: string[] };
    if (!response.ok) {
      return { ok: false, message: extractErrorMessage(data, 'Request failed.') };
    }
    return mapAuthResult(data as BackendAuthResult);
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

function extractErrorMessage(data: { message?: string; details?: string[] }, fallback: string) {
  if (data.details?.length) {
    return data.details.join(' ');
  }
  return data.message ?? fallback;
}

function getNetworkMessage(error: unknown) {
  if (error instanceof Error) {
    return `${error.message}. Check that the Sentri backend is running on your Mac.`;
  }
  return 'Could not reach the Sentri backend. Check that it is running on your Mac.';
}

function detectApiBaseUrl() {
  const explicit = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (explicit) {
    return explicit;
  }

  const scriptURL = NativeModules.SourceCode?.scriptURL as string | undefined;
  const match = scriptURL?.match(/^[a-z]+:\/\/([^/:]+)/i);
  if (match?.[1]) {
    return `http://${match[1]}:8080/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
}
