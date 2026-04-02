import AsyncStorage from '@react-native-async-storage/async-storage';
import type { UserProfile } from '../types/auth';
import { PERSISTENT_KEYS } from './persistent-keys';

const SESSION_TOKEN_KEY = PERSISTENT_KEYS.sessionToken;
const SESSION_USER_KEY = PERSISTENT_KEYS.sessionUser;
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

export async function getStoredSessionUser(): Promise<UserProfile | null> {
  const raw = await AsyncStorage.getItem(SESSION_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as UserProfile;
  } catch {
    await AsyncStorage.removeItem(SESSION_USER_KEY);
    return null;
  }
}

export async function storeSessionUser(profile: UserProfile) {
  await AsyncStorage.setItem(SESSION_USER_KEY, JSON.stringify(profile));
}

export async function clearStoredSessionUser() {
  await AsyncStorage.removeItem(SESSION_USER_KEY);
}

export async function getStoredActiveTab() {
  return AsyncStorage.getItem(ACTIVE_TAB_KEY);
}

export async function storeActiveTab(tab: string) {
  await AsyncStorage.setItem(ACTIVE_TAB_KEY, tab);
}
