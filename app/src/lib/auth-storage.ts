import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_TOKEN_KEY = 'sentri.sessionToken';

export async function getStoredSessionToken() {
  return AsyncStorage.getItem(SESSION_TOKEN_KEY);
}

export async function storeSessionToken(token: string) {
  await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
}

export async function clearStoredSessionToken() {
  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
}
