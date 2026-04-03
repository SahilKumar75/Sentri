const RECENT_SEARCH_LIMIT = 6;

export function normalizeSearchQuery(query: string) {
  return query.trim().replace(/\s+/g, ' ');
}

export function pushRecentSearch(history: string[], query: string) {
  const normalized = normalizeSearchQuery(query);
  if (!normalized) {
    return history;
  }

  return [normalized, ...history.filter((entry) => entry.toLowerCase() !== normalized.toLowerCase())].slice(
    0,
    RECENT_SEARCH_LIMIT
  );
}

export function buildSearchSuggestions(history: string[], items: { tags: string[]; subject: string; title: string }[]) {
  const suggestions = new Set<string>();

  history.forEach((entry) => {
    if (entry) {
      suggestions.add(entry);
    }
  });

  items.forEach((item) => {
    if (suggestions.size >= RECENT_SEARCH_LIMIT) {
      return;
    }
    suggestions.add(item.subject);
    item.tags.slice(0, 2).forEach((tag) => {
      if (suggestions.size < RECENT_SEARCH_LIMIT) {
        suggestions.add(tag);
      }
    });
    if (suggestions.size < RECENT_SEARCH_LIMIT) {
      suggestions.add(item.title.split(' ').slice(0, 2).join(' '));
    }
  });

  return Array.from(suggestions).filter(Boolean).slice(0, RECENT_SEARCH_LIMIT);
}
