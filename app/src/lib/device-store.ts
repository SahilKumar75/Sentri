import AsyncStorage from '@react-native-async-storage/async-storage';

export async function getStoredJson<T>(key: string, fallback: T): Promise<T> {
  try {
    const raw = await AsyncStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export async function setStoredJson(key: string, value: unknown) {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}
