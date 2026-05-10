import { calendarTags, scheduleByDay } from './timetable-fixtures';

export function getEntriesForDate(date) {
  return scheduleByDay[dayKeyForDate(date)] || [];
}

export function buildWeekDates(anchor) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

export function buildMonthRows(anchor) {
  const cells = buildMonthCells(anchor);
  const rows = [];

  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }

  return rows;
}

export function getScheduleInsight(entries, focusedDate, now) {
  if (!entries.length) {
    return {
      status: 'empty',
      currentClass: null,
      nextClass: null,
      headline: 'Nothing planned',
      explanation: 'No timetable items are available for this day yet.',
      recommendedAction: 'upload_timetable',
    };
  }

  const first = entries[0];
  const holiday = entries.length === 1 && first?.title.toLowerCase() === 'holiday';
  if (holiday) {
    return {
      status: 'holiday',
      currentClass: null,
      nextClass: null,
      headline: 'Holiday',
      explanation: first.note ?? 'No classes are scheduled for this day.',
      recommendedAction: 'none',
    };
  }

  if (!isSameDate(focusedDate, now)) {
    return {
      status: 'upcoming',
      currentClass: null,
      nextClass: first ?? null,
      headline: `First class at ${first?.start ?? '--:--'}`,
      explanation: `${first?.title ?? 'Class'} is the first scheduled item for this selected date.`,
      recommendedAction: 'open_today',
    };
  }

  const minutesNow = now.getHours() * 60 + now.getMinutes();
  const currentIndex = entries.findIndex((entry) => {
    const start = toMinutes(entry.start);
    const end = toMinutes(entry.end);
    return minutesNow >= start && minutesNow < end;
  });

  if (currentIndex >= 0) {
    const currentClass = entries[currentIndex];
    const nextClass = entries[currentIndex + 1] ?? null;
    const minutesLeft = Math.max(toMinutes(currentClass.end) - minutesNow, 0);

    return {
      status: 'live',
      currentClass,
      nextClass,
      headline: minutesLeft ? `Live now • ${minutesLeft} min left` : 'Live now',
      explanation: `${currentClass.title} is active in ${currentClass.room} with ${currentClass.teacher}.`,
      recommendedAction: nextClass ? 'check_next_class' : 'none',
    };
  }

  const nextIndex = entries.findIndex((entry) => toMinutes(entry.start) > minutesNow);
  if (nextIndex >= 0) {
    const nextClass = entries[nextIndex];
    const minutesUntil = Math.max(toMinutes(nextClass.start) - minutesNow, 0);
    return {
      status: 'upcoming',
      currentClass: null,
      nextClass,
      headline: `Starts in ${minutesUntil} min`,
      explanation: `${nextClass.title} is the next scheduled class today.`,
      recommendedAction: 'check_next_class',
    };
  }

  return {
    status: 'complete',
    currentClass: null,
    nextClass: null,
    headline: 'Day complete',
    explanation: 'All scheduled classes for today are already finished.',
    recommendedAction: 'upload_timetable',
  };
}

export function getRefreshInsight(today, uploadState, lastUploadMeta) {
  if (uploadState === 'updated') {
    return {
      state: 'updated',
      title: 'Timetable updated',
      body: lastUploadMeta?.imageName
        ? `${lastUploadMeta.imageName} is uploaded and ready for parsing.`
        : 'Your latest timetable upload is staged and ready for parsing.',
      urgency: 'low',
    };
  }

  const refreshDue = today >= getRefreshSaturday(today);
  if (lastUploadMeta) {
    const parserStatus = formatParserStatus(lastUploadMeta);
    return {
      state: refreshDue ? 'due' : 'fresh',
      title: parserStatus.title,
      body: `${parserStatus.body} Last staged from ${formatUploadSource(lastUploadMeta.source)} on ${formatShortDateTime(
        lastUploadMeta.timestamp
      )}${lastUploadMeta.imageName ? ` • ${lastUploadMeta.imageName}` : ''}.`,
      urgency: refreshDue ? 'high' : 'low',
    };
  }

  return {
    state: refreshDue ? 'due' : 'fresh',
    title: refreshDue ? 'Week ready for a fresh upload' : 'Week ready',
    body: 'Every Saturday, upload the new screenshot when the timetable mail arrives.',
    urgency: refreshDue ? 'high' : 'low',
  };
}

export function formatMonthYear(date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
}

export function formatLongDate(date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

export function formatWeekdayShort(date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date);
}

export function formatMonthShort(date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(date);
}

export function formatUploadSource(source) {
  if (source === 'mail') return 'Outlook screenshot';
  if (source === 'photos') return 'Photos';
  return 'Share into Sentri';
}

export function formatParserBadge(status) {
  if (status === 'PARSED') return 'Parsed';
  if (status === 'VERIFIED') return 'Verified';
  if (status === 'PLACEHOLDER') return 'Awaiting parser';
  return 'No parser status';
}

export function formatUploadHistoryTitle(status, entryCount) {
  if (status === 'VERIFIED') {
    return entryCount > 0 ? `${entryCount} verified items` : 'Verified upload';
  }
  if (status === 'PARSED') {
    return entryCount > 0 ? `${entryCount} parsed items` : 'Parsed upload';
  }
  return 'Awaiting parser';
}

function formatParserStatus(lastUploadMeta) {
  if (lastUploadMeta.status === 'VERIFIED') {
    return {
      title: 'Timetable verified',
      body:
        lastUploadMeta.entryCount && lastUploadMeta.entryCount > 0
          ? `${lastUploadMeta.entryCount} timetable items verified for this upload.`
          : 'The latest timetable upload has been verified and is ready to use.',
    };
  }

  if (lastUploadMeta.status === 'PARSED') {
    const confidence =
      typeof lastUploadMeta.extractionConfidence === 'number'
        ? ` Parser confidence ${Math.round(lastUploadMeta.extractionConfidence * 100)}%.`
        : '';
    return {
      title: 'Parser finished',
      body:
        lastUploadMeta.entryCount && lastUploadMeta.entryCount > 0
          ? `${lastUploadMeta.entryCount} timetable items were parsed.${confidence}`
          : `The latest timetable upload has been parsed.${confidence}`,
    };
  }

  return {
    title: 'Parser pending',
    body: 'The latest screenshot is uploaded and waiting for OCR and timetable extraction.',
  };
}

export function formatShortDateTime(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function dayKeyForDate(date) {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
}

export function isSameDate(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function buildMonthCells(anchor) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startIndex = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startIndex + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return { key: `blank-${index}`, date: null, tags: [] };
    }

    const date = new Date(year, month, dayNumber);
    const key = dateKey(date);
    return {
      key,
      date,
      tags: calendarTags[key] ?? [],
    };
  });
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function getRefreshSaturday(date) {
  const saturday = startOfWeek(date);
  saturday.setDate(saturday.getDate() + 5);
  saturday.setHours(0, 0, 0, 0);
  return saturday;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function toMinutes(time) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}
