export type ViewMode = 'today' | 'week' | 'month';

export type ClassEntry = {
  id: string;
  title: string;
  teacher: string;
  room: string;
  start: string;
  end: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Exam' | 'Deadline';
  note?: string;
};

export type CalendarTag = {
  id: string;
  title: string;
  tone: 'accent' | 'blue' | 'green';
};

export type UploadSource = 'share' | 'mail' | 'photos';

export type UploadMeta = {
  batchId: number;
  source: UploadSource;
  timestamp: string;
  imageName?: string;
  status?: string;
  updatedAt?: string;
  extractionConfidence?: number;
  entryCount?: number;
};
