/**
 * Network connectivity monitoring utility
 */

import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

export enum ConnectionType {
  WIFI = 'wifi',
  CELLULAR = 'cellular',
  NONE = 'none',
  UNKNOWN = 'unknown',
}

export interface NetworkStatus {
  isConnected: boolean;
  type: ConnectionType;
  isInternetReachable: boolean | null;
  timestamp: Date;
}

export class NetworkMonitor {
  private static instance: NetworkMonitor;
  private listeners: Set<(status: NetworkStatus) => void> = new Set();
  private currentStatus: NetworkStatus | null = null;
  private unsubscribe: (() => void) | null = null;

  private constructor() {
    this.initialize();
  }

  static getInstance(): NetworkMonitor {
    if (!NetworkMonitor.instance) {
      NetworkMonitor.instance = new NetworkMonitor();
    }
    return NetworkMonitor.instance;
  }

  private initialize(): void {
    this.unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      const status = this.parseNetInfoState(state);
      this.currentStatus = status;
      this.notifyListeners(status);
    });
  }

  /**
   * Get current network status
   */
  async getStatus(): Promise<NetworkStatus> {
    const state = await NetInfo.fetch();
    const status = this.parseNetInfoState(state);
    this.currentStatus = status;
    return status;
  }

  /**
   * Check if device is connected to internet
   */
  async isConnected(): Promise<boolean> {
    const status = await this.getStatus();
    return status.isConnected;
  }

  /**
   * Check if device is on WiFi
   */
  async isWiFi(): Promise<boolean> {
    const status = await this.getStatus();
    return status.type === ConnectionType.WIFI;
  }

  /**
   * Check if device is on cellular
   */
  async isCellular(): Promise<boolean> {
    const status = await this.getStatus();
    return status.type === ConnectionType.CELLULAR;
  }

  /**
   * Add listener for network status changes
   */
  addListener(callback: (status: NetworkStatus) => void): () => void {
    this.listeners.add(callback);
    
    // Immediately call with current status if available
    if (this.currentStatus) {
      callback(this.currentStatus);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.clear();
  }

  /**
   * Wait for internet connection
   */
  async waitForConnection(timeout: number = 30000): Promise<boolean> {
    return new Promise((resolve) => {
      const timeoutId = setTimeout(() => {
        unsubscribe();
        resolve(false);
      }, timeout);

      const unsubscribe = this.addListener((status) => {
        if (status.isConnected) {
          clearTimeout(timeoutId);
          unsubscribe();
          resolve(true);
        }
      });
    });
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
    this.removeAllListeners();
  }

  private parseNetInfoState(state: NetInfoState): NetworkStatus {
    let type: ConnectionType = ConnectionType.UNKNOWN;

    if (state.type === 'wifi') {
      type = ConnectionType.WIFI;
    } else if (state.type === 'cellular') {
      type = ConnectionType.CELLULAR;
    } else if (state.type === 'none') {
      type = ConnectionType.NONE;
    }

    return {
      isConnected: state.isConnected ?? false,
      type,
      isInternetReachable: state.isInternetReachable,
      timestamp: new Date(),
    };
  }

  private notifyListeners(status: NetworkStatus): void {
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (error) {
        console.error('Error in network listener:', error);
      }
    });
  }
}

export const networkMonitor = NetworkMonitor.getInstance();