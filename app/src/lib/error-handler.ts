/**
 * Centralized error handling utilities for the mobile app
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: Date;
}

export class ErrorHandler {
  /**
   * Creates a standardized error object
   */
  static createError(code: string, message: string, details?: any): AppError {
    return {
      code,
      message,
      details,
      timestamp: new Date(),
    };
  }

  /**
   * Handles API errors and converts them to user-friendly messages
   */
  static handleApiError(error: any): AppError {
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 400:
          return this.createError('VALIDATION_ERROR', 
            data.message || 'Invalid request data', data);
        case 401:
          return this.createError('UNAUTHORIZED', 
            'Please log in to continue', data);
        case 403:
          return this.createError('FORBIDDEN', 
            'You do not have permission to perform this action', data);
        case 404:
          return this.createError('NOT_FOUND', 
            'The requested resource was not found', data);
        case 500:
          return this.createError('SERVER_ERROR', 
            'Something went wrong on our end. Please try again later', data);
        default:
          return this.createError('API_ERROR', 
            data.message || 'An unexpected error occurred', data);
      }
    }

    if (error.request) {
      return this.createError('NETWORK_ERROR', 
        'Unable to connect to the server. Please check your internet connection');
    }

    return this.createError('UNKNOWN_ERROR', 
      error.message || 'An unexpected error occurred');
  }

  /**
   * Handles validation errors
   */
  static handleValidationError(field: string, rule: string): AppError {
    const messages: Record<string, string> = {
      required: `${field} is required`,
      email: 'Please enter a valid email address',
      password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
      phone: 'Please enter a valid phone number',
      minLength: `${field} is too short`,
      maxLength: `${field} is too long`,
    };

    return this.createError('VALIDATION_ERROR', 
      messages[rule] || `${field} is invalid`);
  }

  /**
   * Logs error for debugging purposes
   */
  static logError(error: AppError | Error, context?: string): void {
    const logData = {
      context,
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : error,
      timestamp: new Date().toISOString(),
    };

    if (__DEV__) {
      console.error('App Error:', logData);
    }

    // In production, you might want to send this to a logging service
    // LoggingService.reportError(logData);
  }

  /**
   * Determines if an error should be retried
   */
  static shouldRetry(error: AppError): boolean {
    const retryableCodes = ['NETWORK_ERROR', 'SERVER_ERROR', 'TIMEOUT_ERROR'];
    return retryableCodes.includes(error.code);
  }

  /**
   * Gets user-friendly message for display
   */
  static getUserMessage(error: AppError): string {
    return error.message;
  }
}