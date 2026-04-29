/**
 * Application constants and configuration
 */

export const APP_CONFIG = {
  name: 'Sentri',
  version: '1.0.0',
  description: 'Student companion for Army Institute of Technology',
} as const;

export const API_ENDPOINTS = {
  auth: '/api/auth',
  timetable: '/api/timetable',
  myspace: '/api/myspace',
  hangout: '/api/hangout',
  health: '/api/health',
} as const;

export const STORAGE_KEYS = {
  authToken: 'sentri_auth_token',
  userProfile: 'sentri_user_profile',
  timetableCache: 'sentri_timetable_cache',
  myspaceCache: 'sentri_myspace_cache',
  appSettings: 'sentri_app_settings',
} as const;

export const COLORS = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  background: '#F2F2F7',
  surface: '#FFFFFF',
  text: '#000000',
  textSecondary: '#8E8E93',
} as const;

export const DIMENSIONS = {
  borderRadius: 8,
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  fontSize: {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 18,
    xl: 24,
    xxl: 32,
  },
} as const;

export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  },
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumber: true,
  },
  phone: {
    pattern: /^[+]?[1-9]\d{1,14}$/,
  },
} as const;

export const TIMEOUTS = {
  api: 10000, // 10 seconds
  upload: 30000, // 30 seconds
  cache: 300000, // 5 minutes
} as const;