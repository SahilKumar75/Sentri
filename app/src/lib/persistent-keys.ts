export const PERSISTENT_KEYS = {
  sessionToken: 'sentri.sessionToken',
  sessionUser: 'sentri.sessionUser',
  activeTab: 'sentri.activeTab',
  homeUploadMeta: 'sentri.homeUploadMeta',
  myspaceItems: 'sentri.myspace.items',
  calorieState: 'sentri.calorie.state',
  hangoutState: 'sentri.hangout.state',
} as const;

export type PersistentKey = (typeof PERSISTENT_KEYS)[keyof typeof PERSISTENT_KEYS];
