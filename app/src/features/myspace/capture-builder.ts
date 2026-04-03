import type { CaptureOption, SavedItem, SavedItemAccent, SavedItemKind } from './models';

export type CaptureDraft = {
  title: string;
  body: string;
  subject: string;
  source: string;
  tags: string;
  ocrText: string;
};

const subjectMap: Record<string, string> = {
  image: 'Notes',
  link: 'Research',
  note: 'Personal',
  file: 'Placement',
  screenshot: 'Class',
};

const accentMap: Record<string, SavedItemAccent> = {
  image: 'sand',
  link: 'sky',
  note: 'mint',
  file: 'rose',
  screenshot: 'ink',
};

export function createEmptyCaptureDraft(option: CaptureOption): CaptureDraft {
  return {
    title: `${option.label} capture`,
    body: '',
    subject: subjectMap[option.id] ?? 'Personal',
    source: option.hint,
    tags: option.id,
    ocrText: '',
  };
}

export function buildCapturePreview(option: CaptureOption): SavedItem {
  return buildCapturedItem(option, {
    title: `${option.label} capture preview`,
    body: `This ${option.label.toLowerCase()} will be indexed by OCR text, source, date, and subject.`,
    subject: subjectMap[option.id] ?? 'Personal',
    source: option.hint,
    tags: `${option.id}, capture, indexed`,
    ocrText: `${option.label} capture preview for search and retrieval.`,
  });
}

export function buildCapturedItem(option: CaptureOption, draft: CaptureDraft): SavedItem {
  const title = draft.title.trim() || `${option.label} capture`;
  const body = draft.body.trim() || `Saved from ${option.hint} for future retrieval.`;
  const subject = draft.subject.trim() || subjectMap[option.id] || 'Personal';
  const source = draft.source.trim() || option.hint;
  const tags = draft.tags
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return {
    id: `capture-${option.id}-${Date.now()}`,
    title,
    body,
    kind: option.id as SavedItemKind,
    subject,
    tags: tags.length ? tags : [option.id, 'capture'],
    source,
    dateLabel: 'Now',
    accent: accentMap[option.id] ?? 'sand',
    pinned: false,
    featured: true,
    ocrText: draft.ocrText.trim() || `${title} ${body}`,
  };
}
