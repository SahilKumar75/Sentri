import type { SavedItem } from '../../features/myspace/models';

export { captureOptions, savedItems } from '../../features/myspace/seed-data';

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
