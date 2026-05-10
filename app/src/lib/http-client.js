import { NativeModules, Platform } from 'react-native';

export const API_BASE_URL = detectApiBaseUrl();

export async function requestJson(path, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
    const rawText = await response.text();
    const data = rawText ? JSON.parse(rawText) : {};

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: data ?? {},
      };
    }

    return {
      ok: true,
      status: response.status,
      data,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractErrorMessage(data, fallback) {
  if (data.details?.length) {
    return data.details.join(' ');
  }
  return data.message ?? fallback;
}

export function getNetworkMessage(error) {
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

  const scriptURL = NativeModules.SourceCode?.scriptURL;
  const match = scriptURL?.match(/^[a-z]+:\/\/([^/:]+)/i);
  if (match?.[1]) {
    return `http://${match[1]}:8080/api/v1`;
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api/v1';
  }
  return 'http://localhost:8080/api/v1';
}
