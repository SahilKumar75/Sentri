import AsyncStorage from '@react-native-async-storage/async-storage';
import { PERSISTENT_KEYS } from './persistent-keys';

import * as SecureStore from 'expo-secure-store';

const SESSION_TOKEN_KEY = PERSISTENT_KEYS.sessionToken;
const SESSION_USER_KEY = PERSISTENT_KEYS.sessionUser;
const ACTIVE_TAB_KEY = PERSISTENT_KEYS.activeTab;

export async function getStoredSessionToken() {
  return SecureStore.getItemAsync(SESSION_TOKEN_KEY);
}

export async function storeSessionToken(token) {
  await SecureStore.setItemAsync(SESSION_TOKEN_KEY, token);
}

export async function clearStoredSessionToken() {
  await SecureStore.deleteItemAsync(SESSION_TOKEN_KEY);
}

export async function getStoredSessionUser() {
  const raw = await AsyncStorage.getItem(SESSION_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    await AsyncStorage.removeItem(SESSION_USER_KEY);
    return null;
  }
}

export async function storeSessionUser(profile) {
  await AsyncStorage.setItem(SESSION_USER_KEY, JSON.stringify(profile));
}

export async function clearStoredSessionUser() {
  await AsyncStorage.removeItem(SESSION_USER_KEY);
}

export async function getStoredActiveTab() {
  return AsyncStorage.getItem(ACTIVE_TAB_KEY);
}

export async function storeActiveTab(tab) {
  await AsyncStorage.setItem(ACTIVE_TAB_KEY, tab);
}
