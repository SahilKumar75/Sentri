/**
 * Analytics and tracking utilities for user behavior insights
 */

export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

export class Analytics {
  private static instance: Analytics;
  private sessionId: string;
  private userId?: string;
  private events: AnalyticsEvent[] = [];
  private isEnabled: boolean = true;

  private constructor() {
    this.sessionId = this.generateSessionId();
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  /**
   * Initialize analytics with user context
   */
  initialize(userId?: string, options?: { enabled?: boolean }): void {
    this.userId = userId;
    this.isEnabled = options?.enabled ?? true;
    
    if (this.isEnabled) {
      this.track('app_initialized', {
        platform: 'mobile',
        userId: userId || 'anonymous',
      });
    }
  }

  /**
   * Track an event
   */
  track(eventName: string, properties?: Record<string, any>): void {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name: eventName,
      properties: {
        ...properties,
        platform: 'mobile',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    this.events.push(event);
    
    if (__DEV__) {
      console.log('Analytics Event:', event);
    }

    // In production, send to analytics service
    this.sendToAnalyticsService(event);
  }

  /**
   * Track screen view
   */
  trackScreen(screenName: string, properties?: Record<string, any>): void {
    this.track('screen_view', {
      screen_name: screenName,
      ...properties,
    });
  }

  /**
   * Track user action
   */
  trackAction(action: string, category: string, properties?: Record<string, any>): void {
    this.track('user_action', {
      action,
      category,
      ...properties,
    });
  }

  /**
   * Track error events
   */
  trackError(error: Error, context?: string): void {
    this.track('error_occurred', {
      error_name: error.name,
      error_message: error.message,
      error_stack: error.stack,
      context,
    });
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: string, value: number, unit: string = 'ms'): void {
    this.track('performance_metric', {
      metric,
      value,
      unit,
    });
  }

  /**
   * Set user properties
   */
  setUserProperties(properties: Record<string, any>): void {
    if (!this.isEnabled) return;

    this.track('user_properties_updated', {
      properties,
    });
  }

  /**
   * Enable or disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    
    if (enabled) {
      this.track('analytics_enabled');
    }
  }

  /**
   * Get current session events
   */
  getSessionEvents(): AnalyticsEvent[] {
    return [...this.events];
  }

  /**
   * Clear session events
   */
  clearSession(): void {
    this.events = [];
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async sendToAnalyticsService(event: AnalyticsEvent): Promise<void> {
    try {
      // In production, implement actual analytics service integration
      // Examples: Firebase Analytics, Mixpanel, Amplitude, etc.
      
      if (__DEV__) {
        // In development, just log
        return;
      }

      // Example implementation:
      // await fetch('/api/analytics', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(event),
      // });
      
    } catch (error) {
      if (__DEV__) {
        console.error('Failed to send analytics event:', error);
      }
    }
  }
}

// Convenience export
export const analytics = Analytics.getInstance();