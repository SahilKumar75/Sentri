import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERSISTENT_KEYS } from './persistent-keys';

const SESSION_TOKEN_KEY = PERSISTENT_KEYS.sessionToken;
const ACTIVE_TAB_KEY = PERSISTENT_KEYS.activeTab;

export async function getStoredSessionToken() {
  return AsyncStorage.getItem(SESSION_TOKEN_KEY);
}

export async function storeSessionToken(token: string) {
  await AsyncStorage.setItem(SESSION_TOKEN_KEY, token);
}

export async function clearStoredSessionToken() {
  await AsyncStorage.removeItem(SESSION_TOKEN_KEY);
}

export async function getStoredActiveTab() {
  return AsyncStorage.getItem(ACTIVE_TAB_KEY);
}

export async function storeActiveTab(tab: string) {
  await AsyncStorage.setItem(ACTIVE_TAB_KEY, tab);
}
