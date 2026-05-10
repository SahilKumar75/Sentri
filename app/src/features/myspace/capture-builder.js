
const subjectMap = {
  image: 'Notes',
  link: 'Research',
  note: 'Personal',
  file: 'Placement',
  screenshot: 'Class',
};

const accentMap = {
  image: 'sand',
  link: 'sky',
  note: 'mint',
  file: 'rose',
  screenshot: 'ink',
};

export function createEmptyCaptureDraft(option) {
  return {
    title: `${option.label} capture`,
    body: '',
    subject: subjectMap[option.id] ?? 'Personal',
    source: option.hint,
    tags: option.id,
    ocrText: '',
  };
}

export function buildCapturePreview(option) {
  return buildCapturedItem(option, {
    title: `${option.label} capture preview`,
    body: `This ${option.label.toLowerCase()} will be indexed by OCR text, source, date, and subject.`,
    subject: subjectMap[option.id] ?? 'Personal',
    source: option.hint,
    tags: `${option.id}, capture, indexed`,
    ocrText: `${option.label} capture preview for search and retrieval.`,
  });
}

export function buildCapturedItem(option, draft) {
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
    kind: option.id,
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
