import AsyncStorage from '@react-native-async-storage/async-storage';

const memoryCache = new Map();

export async function getStoredJson(key, fallback) {
  try {
    const cached = memoryCache.get(key);
    const raw = cached === undefined ? await AsyncStorage.getItem(key) : cached;
    if (cached === undefined) {
      memoryCache.set(key, raw);
    }
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export async function setStoredJson(key, value) {
  const raw = JSON.stringify(value);
  memoryCache.set(key, raw);
  await AsyncStorage.setItem(key, raw);
}

export async function getStoredString(key, fallback = '') {
  const cached = memoryCache.get(key);
  if (cached !== undefined) {
    return cached ?? fallback;
  }

  const raw = await AsyncStorage.getItem(key);
  memoryCache.set(key, raw);
  return raw ?? fallback;
}

export async function setStoredString(key, value) {
  memoryCache.set(key, value);
  await AsyncStorage.setItem(key, value);
}

export async function removeStoredValue(key) {
  memoryCache.delete(key);
  await AsyncStorage.removeItem(key);
}

export async function primeStoredJson(key, fallback) {
  const value = await getStoredJson(key, fallback);
  return value;
}
