export type SavedItemKind = 'image' | 'link' | 'note' | 'file' | 'screenshot';

export type SavedItemAccent = 'sand' | 'sky' | 'mint' | 'rose' | 'ink';

export type SavedItem = {
  id: string;
  title: string;
  body: string;
  kind: SavedItemKind;
  subject: string;
  tags: string[];
  source: string;
  dateLabel: string;
  accent: SavedItemAccent;
  pinned?: boolean;
  featured?: boolean;
  ocrText?: string;
};

export type CaptureOption = {
  id: string;
  label: string;
  hint: string;
  symbol: string;
};
