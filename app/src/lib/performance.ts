/**
 * Performance monitoring and optimization utilities
 */

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private timers: Map<string, number> = new Map();

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start timing an operation
   */
  startTimer(name: string): void {
    this.timers.set(name, Date.now());
  }

  /**
   * End timing and record metric
   */
  endTimer(name: string, metadata?: Record<string, any>): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      console.warn(`Timer '${name}' was not started`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.timers.delete(name);

    this.recordMetric(name, duration, 'ms', metadata);
    return duration;
  }

  /**
   * Record a performance metric
   */
  recordMetric(name: string, value: number, unit: string = 'ms', metadata?: Record<string, any>): void {
    const metric: PerformanceMetric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      metadata,
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics to prevent memory issues
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    if (__DEV__) {
      console.log(`Performance: ${name} = ${value}${unit}`, metadata);
    }
  }

  /**
   * Measure function execution time
   */
  async measureAsync<T>(name: string, fn: () => Promise<T>, metadata?: Record<string, any>): Promise<T> {
    this.startTimer(name);
    try {
      const result = await fn();
      this.endTimer(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Measure synchronous function execution time
   */
  measure<T>(name: string, fn: () => T, metadata?: Record<string, any>): T {
    this.startTimer(name);
    try {
      const result = fn();
      this.endTimer(name, { ...metadata, success: true });
      return result;
    } catch (error) {
      this.endTimer(name, { ...metadata, success: false, error: error.message });
      throw error;
    }
  }

  /**
   * Get performance statistics
   */
  getStats(metricName?: string): Record<string, any> {
    const filteredMetrics = metricName 
      ? this.metrics.filter(m => m.name === metricName)
      : this.metrics;

    if (filteredMetrics.length === 0) {
      return { count: 0 };
    }

    const values = filteredMetrics.map(m => m.value);
    const sum = values.reduce((a, b) => a + b, 0);
    const avg = sum / values.length;
    const min = Math.min(...values);
    const max = Math.max(...values);

    // Calculate percentiles
    const sorted = [...values].sort((a, b) => a - b);
    const p50 = sorted[Math.floor(sorted.length * 0.5)];
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const p95 = sorted[Math.floor(sorted.length * 0.95)];

    return {
      count: filteredMetrics.length,
      sum,
      avg: Math.round(avg * 100) / 100,
      min,
      max,
      p50,
      p90,
      p95,
      unit: filteredMetrics[0]?.unit || 'ms',
    };
  }

  /**
   * Get all metrics
   */
  getAllMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.metrics = [];
    this.timers.clear();
  }

  /**
   * Monitor React Native performance
   */
  monitorRNPerformance(): void {
    if (typeof global !== 'undefined' && global.performance) {
      // Monitor navigation performance
      const originalNavigate = global.navigation?.navigate;
      if (originalNavigate) {
        global.navigation.navigate = (...args: any[]) => {
          this.startTimer('navigation');
          const result = originalNavigate.apply(global.navigation, args);
          // End timer after next tick to capture navigation completion
          setTimeout(() => this.endTimer('navigation', { screen: args[0] }), 0);
          return result;
        };
      }
    }
  }
}

// Convenience exports
export const performanceMonitor = PerformanceMonitor.getInstance();

// Decorator for measuring method performance
export function measurePerformance(metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measure(name, () => method.apply(this, args));
    };
  };
}

// Async decorator for measuring async method performance
export function measureAsyncPerformance(metricName?: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    const name = metricName || `${target.constructor.name}.${propertyName}`;

    descriptor.value = function (...args: any[]) {
      return performanceMonitor.measureAsync(name, () => method.apply(this, args));
    };
  };
}