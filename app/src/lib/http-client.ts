import { NativeModules, Platform } from 'react-native';

export type ApiErrorPayload = {
  message?: string;
  details?: string[];
};

export type JsonResponse<T> =
  | {
      ok: true;
      status: number;
      data: T;
    }
  | {
      ok: false;
      status: number;
      error: ApiErrorPayload;
    };

export const API_BASE_URL = detectApiBaseUrl();

export async function requestJson<T>(
  path: string,
  options: RequestInit & { timeoutMs?: number } = {}
): Promise<JsonResponse<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs ?? 8000);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
    });
    const rawText = await response.text();
    const data = rawText ? (JSON.parse(rawText) as T | ApiErrorPayload) : ({} as T);

    if (!response.ok) {
      return {
        ok: false,
        status: response.status,
        error: (data as ApiErrorPayload) ?? {},
      };
    }

    return {
      ok: true,
      status: response.status,
      data: data as T,
    };
  } finally {
    clearTimeout(timeout);
  }
}

export function extractErrorMessage(data: ApiErrorPayload, fallback: string) {
  if (data.details?.length) {
    return data.details.join(' ');
  }
  return data.message ?? fallback;
}

export function getNetworkMessage(error: unknown) {
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
