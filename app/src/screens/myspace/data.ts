export type SavedItemKind = 'image' | 'link' | 'note' | 'file' | 'screenshot';

export type SavedItem = {
  id: string;
  title: string;
  body: string;
  kind: SavedItemKind;
  subject: string;
  tags: string[];
  source: string;
  dateLabel: string;
  accent: 'sand' | 'sky' | 'mint' | 'rose' | 'ink';
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

export const subjectChips = [
  'All',
  'DBMS',
  'OS',
  'CG',
  'P&S',
  'PM',
  'Placement',
  'Personal',
  'Fitness',
];

export const captureOptions: CaptureOption[] = [
  { id: 'image', label: 'Image', hint: 'Board photo or slide', symbol: 'photo' },
  { id: 'link', label: 'Link', hint: 'Article or drive link', symbol: 'link' },
  { id: 'note', label: 'Note', hint: 'Quick thought or reminder', symbol: 'note.text' },
  { id: 'file', label: 'File', hint: 'PDF or doc upload', symbol: 'doc' },
  { id: 'screenshot', label: 'Screenshot', hint: 'Share from any app', symbol: 'rectangle.on.rectangle' },
];

export const savedItems: SavedItem[] = [
  {
    id: 'math-blackboard',
    title: 'Permutation and Combination',
    body: 'Blackboard photo from class, with examples about arrangements and selection.',
    kind: 'image',
    subject: 'P&S',
    tags: ['math', 'blackboard', 'lecture', 'combinatorics'],
    source: 'Board photo',
    dateLabel: 'Today',
    accent: 'sand',
    pinned: true,
    featured: true,
    ocrText: 'Permutation and Combination, class examples, arrangements, selection.',
  },
  {
    id: 'dbms-sheet',
    title: 'DBMS normal forms',
    body: 'Quick screenshot from the lecture slide with 1NF, 2NF and 3NF notes.',
    kind: 'screenshot',
    subject: 'DBMS',
    tags: ['dbms', 'normal forms', 'exam', 'study'],
    source: 'Screenshot',
    dateLabel: 'Yesterday',
    accent: 'sky',
    pinned: true,
    ocrText: '1NF 2NF 3NF normalization and examples.',
  },
  {
    id: 'os-link',
    title: 'OS paging article',
    body: 'Saved link for page replacement and demand paging revision.',
    kind: 'link',
    subject: 'OS',
    tags: ['operating systems', 'paging', 'revision'],
    source: 'Browser share',
    dateLabel: 'Mon',
    accent: 'mint',
    ocrText: 'Page replacement, FIFO, LRU, demand paging.',
  },
  {
    id: 'placement-drive',
    title: 'Placement drive schedule',
    body: 'PDF containing deadlines, eligibility, and interview rounds.',
    kind: 'file',
    subject: 'Placement',
    tags: ['placement', 'deadline', 'interview'],
    source: 'PDF',
    dateLabel: '2d ago',
    accent: 'rose',
    featured: true,
    ocrText: 'Registration deadline, interview date, eligibility criteria, company name.',
  },
  {
    id: 'fitness-meal',
    title: 'Paneer rice meal estimate',
    body: 'Meal note for bulk tracking with rough calories and protein.',
    kind: 'note',
    subject: 'Fitness',
    tags: ['meal', 'calories', 'protein'],
    source: 'Manual note',
    dateLabel: 'Fri',
    accent: 'ink',
    ocrText: 'Paneer rice, 640 calories, 30g protein.',
  },
  {
    id: 'cg-assignment',
    title: 'Computer Graphics assignment',
    body: 'Reference for clipping, z-buffer and transformation questions.',
    kind: 'image',
    subject: 'CG',
    tags: ['graphics', 'assignment', 'z-buffer'],
    source: 'Gallery import',
    dateLabel: 'Last week',
    accent: 'sand',
    ocrText: 'Z buffer algorithm, clipping and transformation.',
  },
  {
    id: 'pm-timeline',
    title: 'Project management task list',
    body: 'Short list for sprint review, assignments and submission dates.',
    kind: 'note',
    subject: 'PM',
    tags: ['project', 'timeline', 'assignment'],
    source: 'Quick add',
    dateLabel: 'Today',
    accent: 'mint',
    ocrText: 'Sprint review, assignment no. 7, submission checklist.',
  },
  {
    id: 'personal-link',
    title: 'Roommate grocery link',
    body: 'Link to shared shopping list and monthly budget tracker.',
    kind: 'link',
    subject: 'Personal',
    tags: ['budget', 'shopping', 'shared'],
    source: 'Shared link',
    dateLabel: 'Sun',
    accent: 'sky',
    ocrText: 'Shopping list, budget tracker, shared groceries.',
  },
];

export function searchSavedItems(
  items: SavedItem[],
  query: string,
  subject: string,
): SavedItem[] {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedSubject = subject.trim();

  const scored = items
    .map((item, index) => {
      const haystack = [
        item.title,
        item.body,
        item.subject,
        item.source,
        item.dateLabel,
        item.ocrText ?? '',
        item.tags.join(' '),
      ]
        .join(' ')
        .toLowerCase();

      const subjectMatches =
        normalizedSubject === 'All' || item.subject === normalizedSubject;

      if (!subjectMatches) {
        return null;
      }

      if (!normalizedQuery) {
        return {
          item,
          score: (item.pinned ? 100 : 0) + (item.featured ? 30 : 0) - index,
        };
      }

      const queryTokens = normalizedQuery
        .split(/\s+/)
        .filter(Boolean);

      let score = 0;
      for (const token of queryTokens) {
        if (item.title.toLowerCase().includes(token)) score += 20;
        if (item.body.toLowerCase().includes(token)) score += 14;
        if (item.subject.toLowerCase().includes(token)) score += 18;
        if (item.source.toLowerCase().includes(token)) score += 10;
        if (item.dateLabel.toLowerCase().includes(token)) score += 8;
        if ((item.ocrText ?? '').toLowerCase().includes(token)) score += 16;
        if (item.tags.some((tag) => tag.toLowerCase().includes(token))) score += 12;
        if (haystack.includes(token)) score += 6;
      }

      if (score === 0) {
        return null;
      }

      return {
        item,
        score,
      };
    })
    .filter((entry): entry is { item: SavedItem; score: number } => entry !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.item.pinned !== right.item.pinned) {
        return left.item.pinned ? -1 : 1;
      }

      return left.item.title.localeCompare(right.item.title);
    });

  return scored.map((entry) => entry.item);
}
