

const SUBJECT_ALIASES = {
  DBMS: ['database', 'db', 'normalization', 'sql', 'normal form', 'normal forms'],
  'P&S': ['math', 'statistics', 'probability', 'permutation', 'combination', 'stats'],
  OS: ['operating systems', 'operating system', 'paging', 'cpu', 'memory', 'process'],
  CG: ['graphics', 'computer graphics', 'z buffer', 'transformation', 'rendering'],
  PM: ['project', 'sprint', 'timeline', 'project management', 'submission'],
  Placement: ['interview', 'aptitude', 'company', 'job'],
};

const CONTEXT_ALIASES = {
  assignment: ['homework', 'submission', 'task', 'practical file', 'writeup'],
  blackboard: ['board', 'chalkboard', 'class board'],
  image: ['photo', 'picture', 'gallery'],
  lab: ['practical', 'experiment', 'lab manual', 'lab file'],
  lecture: ['class', 'slides', 'slide', 'session'],
  notes: ['note', 'study material', 'material', 'handout', 'summary'],
  revision: ['study', 'prep', 'practice', 'exam prep', 'revise'],
  screenshot: ['screen', 'slide', 'capture', 'screen grab'],
  timetable: ['schedule', 'routine', 'weekly plan', 'class schedule'],
};

export function rankMyspaceItems(items, query, subject = 'All') {
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedSubject = subject.trim();

  return items
    .map((item, index) => scoreItem(item, normalizedQuery, normalizedSubject, index))
    .filter((entry) => entry !== null)
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }
      if (left.item.pinned !== right.item.pinned) {
        return left.item.pinned ? -1 : 1;
      }
      return left.item.title.localeCompare(right.item.title);
    });
}

export function explainMatch(match, fallbackItem, query) {
  if (!query.trim()) {
    return fallbackItem.featured ? 'Suggested from recent study context' : 'Indexed for OCR, subject, and date recall';
  }
  if (!match) {
    return 'Matched by context';
  }
  if (match.reasons.includes('title')) return 'Matched title';
  if (match.reasons.includes('subject') || match.reasons.includes('subject-alias')) return 'Matched subject';
  if (match.reasons.includes('ocr')) return 'Matched OCR text';
  if (match.reasons.includes('date')) return 'Matched date memory';
  if (match.reasons.includes('source') || match.reasons.includes('context-alias')) return 'Matched source or context';
  if (match.reasons.includes('tag') || match.reasons.includes('semantic-alias')) return 'Matched concept';
  return match.explanation;
}

function scoreItem(item, normalizedQuery, normalizedSubject, index) {
  const subjectMatches = normalizedSubject === 'All' || item.subject === normalizedSubject;
  if (!subjectMatches) {
    return null;
  }

  if (!normalizedQuery) {
    return {
      item,
      score: (item.pinned ? 100 : 0) + (item.featured ? 30 : 0) - index,
      reasons: item.featured ? ['semantic-alias'] : ['tag'],
      explanation: item.featured ? 'Suggested from recent study context' : 'Indexed for OCR, subject, and date recall',
    };
  }

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const title = item.title.toLowerCase();
  const body = item.body.toLowerCase();
  const subject = item.subject.toLowerCase();
  const source = item.source.toLowerCase();
  const dateLabel = item.dateLabel.toLowerCase();
  const ocr = (item.ocrText ?? '').toLowerCase();
  const tags = item.tags.map((tag) => tag.toLowerCase());

  const reasons = new Set();
  let score = 0;

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 28;
      reasons.add('title');
    }
    if (body.includes(token)) {
      score += 16;
      reasons.add('body');
    }
    if (subject.includes(token)) {
      score += 18;
      reasons.add('subject');
    }
    if (source.includes(token)) {
      score += 12;
      reasons.add('source');
    }
    if (dateLabel.includes(token)) {
      score += 10;
      reasons.add('date');
    }
    if (ocr.includes(token)) {
      score += 22;
      reasons.add('ocr');
    }
    if (tags.some((tag) => tag.includes(token))) {
      score += 14;
      reasons.add('tag');
    }

    const normalizedAliases = expandAliases(token);
    if (normalizedAliases.some((alias) => SUBJECT_ALIASES[item.subject]?.some((mapped) => mapped.includes(alias)))) {
      score += 20;
      reasons.add('subject-alias');
    }
    if (normalizedAliases.some((alias) => source.includes(alias) || tags.some((tag) => tag.includes(alias)))) {
      score += 11;
      reasons.add('context-alias');
    }
    if (normalizedAliases.some((alias) => body.includes(alias) || ocr.includes(alias))) {
      score += 9;
      reasons.add('semantic-alias');
    }
  }

  if (score === 0) {
    return null;
  }

  const orderedReasons = Array.from(reasons);
  return {
    item,
    score,
    reasons: orderedReasons,
    explanation: buildExplanation(orderedReasons),
  };
}

function expandAliases(token) {
  const aliases = new Set([token]);
  Object.entries(CONTEXT_ALIASES).forEach(([root, related]) => {
    if (root.includes(token) || related.some((value) => value.includes(token))) {
      aliases.add(root);
      related.forEach((value) => aliases.add(value));
    }
  });
  return Array.from(aliases);
}

function buildExplanation(reasons) {
  if (reasons.includes('title')) return 'Matched title';
  if (reasons.includes('subject-alias')) return 'Matched subject alias';
  if (reasons.includes('ocr')) return 'Matched OCR text';
  if (reasons.includes('context-alias')) return 'Matched source or context';
  if (reasons.includes('date')) return 'Matched date memory';
  return 'Matched by context';
}
