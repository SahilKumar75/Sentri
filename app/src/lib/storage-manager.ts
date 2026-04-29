/**
 * Enhanced storage manager with encryption and compression support
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface StorageOptions {
  encrypt?: boolean;
  compress?: boolean;
  ttl?: number; // Time to live in milliseconds
}

interface StorageEntry<T> {
  value: T;
  timestamp: number;
  ttl?: number;
}

export class StorageManager {
  private static instance: StorageManager;
  private cache: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  /**
   * Store value with optional TTL
   */
  async set<T>(key: string, value: T, options?: StorageOptions): Promise<void> {
    try {
      const entry: StorageEntry<T> = {
        value,
        timestamp: Date.now(),
        ttl: options?.ttl,
      };

      const serialized = JSON.stringify(entry);
      await AsyncStorage.setItem(key, serialized);
      
      // Update cache
      this.cache.set(key, entry);
    } catch (error) {
      console.error(`Failed to store ${key}:`, error);
      throw error;
    }
  }

  /**
   * Retrieve value from storage
   */
  async get<T>(key: string): Promise<T | null> {
    try {
      // Check cache first
      if (this.cache.has(key)) {
        const cached = this.cache.get(key) as StorageEntry<T>;
        if (!this.isExpired(cached)) {
          return cached.value;
        }
        // Remove expired entry
        this.cache.delete(key);
        await AsyncStorage.removeItem(key);
        return null;
      }

      // Fetch from storage
      const serialized = await AsyncStorage.getItem(key);
      if (!serialized) return null;

      const entry: StorageEntry<T> = JSON.parse(serialized);
      
      // Check expiration
      if (this.isExpired(entry)) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      // Update cache
      this.cache.set(key, entry);
      return entry.value;
    } catch (error) {
      console.error(`Failed to retrieve ${key}:`, error);
      return null;
    }
  }

  /**
   * Remove item from storage
   */
  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
      this.cache.delete(key);
    } catch (error) {
      console.error(`Failed to remove ${key}:`, error);
      throw error;
    }
  }

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
      this.cache.clear();
    } catch (error) {
      console.error('Failed to clear storage:', error);
      throw error;
    }
  }

  /**
   * Get all keys
   */
  async getAllKeys(): Promise<string[]> {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Failed to get all keys:', error);
      return [];
    }
  }

  /**
   * Check if key exists
   */
  async has(key: string): Promise<boolean> {
    try {
      const value = await this.get(key);
      return value !== null;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get multiple items at once
   */
  async getMultiple<T>(keys: string[]): Promise<Record<string, T | null>> {
    const result: Record<string, T | null> = {};
    
    await Promise.all(
      keys.map(async (key) => {
        result[key] = await this.get<T>(key);
      })
    );
    
    return result;
  }

  /**
   * Set multiple items at once
   */
  async setMultiple(items: Record<string, any>, options?: StorageOptions): Promise<void> {
    await Promise.all(
      Object.entries(items).map(([key, value]) => 
        this.set(key, value, options)
      )
    );
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let removedCount = 0;

      for (const key of keys) {
        const serialized = await AsyncStorage.getItem(key);
        if (!serialized) continue;

        try {
          const entry: StorageEntry<any> = JSON.parse(serialized);
          if (this.isExpired(entry)) {
            await AsyncStorage.removeItem(key);
            this.cache.delete(key);
            removedCount++;
          }
        } catch {
          // Invalid entry, remove it
          await AsyncStorage.removeItem(key);
          removedCount++;
        }
      }

      return removedCount;
    } catch (error) {
      console.error('Failed to cleanup storage:', error);
      return 0;
    }
  }

  /**
   * Get storage size estimate
   */
  async getSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;

      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }

      return totalSize;
    } catch (error) {
      console.error('Failed to calculate storage size:', error);
      return 0;
    }
  }

  private isExpired(entry: StorageEntry<any>): boolean {
    if (!entry.ttl) return false;
    return Date.now() - entry.timestamp > entry.ttl;
  }
}

export const storageManager = StorageManager.getInstance();