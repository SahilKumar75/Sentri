import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryCache = new Map<string, string | null>();

export async function getStoredJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const cached = memoryCache.get(key);
    const raw = cached === undefined ? await AsyncStorage.getItem(key) : cached;
    if (cached === undefined) {
      memoryCache.set(key, raw);
    }
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setStoredJson(key: string, value: unknown) {
  const raw = JSON.stringify(value);
  memoryCache.set(key, raw);
  await AsyncStorage.setItem(key, raw);
}

export async function getStoredString(key: string, fallback = '') {
  const cached = memoryCache.get(key);
  if (cached !== undefined) {
    return cached ?? fallback;
  }

  const raw = await AsyncStorage.getItem(key);
  memoryCache.set(key, raw);
  return raw ?? fallback;
}

export async function setStoredString(key: string, value: string) {
  memoryCache.set(key, value);
  await AsyncStorage.setItem(key, value);
}

export async function removeStoredValue(key: string) {
  memoryCache.delete(key);
  await AsyncStorage.removeItem(key);
}

export async function primeStoredJson<T>(key: string, fallback: T): Promise<T> {
  const value = await getStoredJson(key, fallback);
  return value;
}
