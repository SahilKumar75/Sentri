import { API_BASE_URL, extractErrorMessage, getNetworkMessage, requestJson } from './http-client';

export async function signup(payload) {
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

export async function verifyOtp(payload) {
  return postAuth('/auth/verify-otp', payload);
}

export async function login(payload) {
  return postAuth('/auth/login', payload);
}

export async function restoreSession(sessionToken) {
  try {
    const response = await requestJson('/auth/session', {
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

export async function logout(sessionToken) {
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

async function postAuth(path, payload) {
  try {
    const response = await requestJson(path, {
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

function mapAuthResult(data) {
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

function mapUser(user) {
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

function formatDob(dob) {
  if (!dob.includes('-')) {
    return dob;
  }
  const [year, month, day] = dob.split('-');
  return `${day}/${month}/${year}`;
}
