import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';

type HomeScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

type ViewMode = 'today' | 'week' | 'month';

type ClassEntry = {
  id: string;
  title: string;
  teacher: string;
  room: string;
  start: string;
  end: string;
  type: 'Lecture' | 'Lab' | 'Tutorial' | 'Exam' | 'Deadline';
  note?: string;
};

type CalendarTag = {
  id: string;
  title: string;
  tone: 'accent' | 'blue' | 'green';
};

const todayAnchor = new Date('2026-03-23T14:30:00+05:30');
const saturdayRefreshDate = new Date('2026-03-28T00:00:00+05:30');

const scheduleByDay: Record<string, ClassEntry[]> = {
  mon: [
    {
      id: 'mon-1',
      title: 'DBMS',
      teacher: 'Prof. Deshmukh',
      room: 'LH 19',
      start: '08:45',
      end: '09:45',
      type: 'Lecture',
      note: 'Parallel database basics and attendance check.',
    },
    {
      id: 'mon-2',
      title: 'Project Management',
      teacher: 'Dr. Kulkarni',
      room: 'LH 20',
      start: '09:50',
      end: '10:45',
      type: 'Lecture',
      note: 'Sprint review and assignment tracker.',
    },
    {
      id: 'mon-3',
      title: 'DBMS Lab',
      teacher: 'Prof. Deshmukh',
      room: 'VI Lab',
      start: '11:00',
      end: '12:45',
      type: 'Lab',
      note: 'Assignment 7 submission in PL/SQL.',
    },
    {
      id: 'mon-4',
      title: 'Probability & Statistics',
      teacher: 'Prof. Shah',
      room: 'LH 18',
      start: '13:45',
      end: '14:45',
      type: 'Tutorial',
      note: 'Permutation and combination problem set.',
    },
  ],
  tue: [
    {
      id: 'tue-1',
      title: 'Computer Graphics',
      teacher: 'Prof. Patil',
      room: 'LH 21',
      start: '08:45',
      end: '09:45',
      type: 'Lecture',
    },
    {
      id: 'tue-2',
      title: 'DBMS',
      teacher: 'Prof. Deshmukh',
      room: 'LH 19',
      start: '09:50',
      end: '10:45',
      type: 'Lecture',
      note: 'Distributed database overview.',
    },
    {
      id: 'tue-3',
      title: 'E-Commerce',
      teacher: 'Prof. Ghule',
      room: 'Tut Room',
      start: '12:45',
      end: '13:45',
      type: 'Tutorial',
      note: 'Security tools and best practices.',
    },
  ],
  wed: [
    {
      id: 'wed-1',
      title: 'Computer Graphics Lab',
      teacher: 'Prof. Patil',
      room: 'Lab III',
      start: '08:45',
      end: '10:45',
      type: 'Lab',
    },
    {
      id: 'wed-2',
      title: 'Project Management',
      teacher: 'Dr. Kulkarni',
      room: 'LH 20',
      start: '11:00',
      end: '12:00',
      type: 'Lecture',
    },
    {
      id: 'wed-3',
      title: 'EVS',
      teacher: 'Prof. More',
      room: 'LH 16',
      start: '14:45',
      end: '15:45',
      type: 'Lecture',
      note: 'Short lecture before placement session.',
    },
  ],
  thu: [
    {
      id: 'thu-1',
      title: 'Holiday',
      teacher: 'AIT',
      room: 'Campus',
      start: '00:00',
      end: '23:59',
      type: 'Deadline',
      note: 'No classes scheduled.',
    },
  ],
  fri: [
    {
      id: 'fri-1',
      title: 'Machine Learning',
      teacher: 'Prof. Jadhav',
      room: 'LH 17',
      start: '08:45',
      end: '09:45',
      type: 'Lecture',
    },
    {
      id: 'fri-2',
      title: 'CG Lab',
      teacher: 'Prof. Patil',
      room: 'Lab II',
      start: '11:00',
      end: '12:45',
      type: 'Lab',
      note: 'Painter algorithm revision and viva prep.',
    },
  ],
  sat: [
    {
      id: 'sat-1',
      title: 'Timetable Refresh',
      teacher: 'Sentri',
      room: 'Share Sheet',
      start: '10:00',
      end: '10:15',
      type: 'Deadline',
      note: 'Upload next week timetable screenshot here.',
    },
  ],
  sun: [],
};

const calendarTags: Record<string, CalendarTag[]> = {
  '2026-03-23': [{ id: 'dbms', title: 'DBMS exam form', tone: 'blue' }],
  '2026-03-24': [{ id: 'resume', title: 'Resume check', tone: 'green' }],
  '2026-03-25': [{ id: 'cg', title: 'CG viva', tone: 'accent' }],
  '2026-03-26': [{ id: 'holiday', title: 'Holiday', tone: 'green' }],
  '2026-03-27': [{ id: 'pm', title: 'PM submission', tone: 'accent' }],
  '2026-03-28': [{ id: 'refresh', title: 'Upload timetable', tone: 'blue' }],
  '2026-03-31': [{ id: 'hackathon', title: 'Hackathon deadline', tone: 'accent' }],
  '2026-04-02': [{ id: 'placement', title: 'Placement drive', tone: 'green' }],
  '2026-04-04': [{ id: 'dbms-exam', title: 'DBMS exam', tone: 'blue' }],
};

export default function HomeScreen({ onOpenDrawer, avatarLabel }: HomeScreenProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [focusedDate, setFocusedDate] = useState(todayAnchor);
  const [hoveredClassId, setHoveredClassId] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'updated'>('idle');

  const weekDays = useMemo(() => buildWeekDates(focusedDate), [focusedDate]);
  const monthRows = useMemo(() => buildMonthRows(focusedDate), [focusedDate]);
  const selectedDayKey = dayKeyForDate(focusedDate);
  const selectedEntries = scheduleByDay[selectedDayKey] || [];
  const hoveredClass = selectedEntries.find((entry) => entry.id === hoveredClassId) ?? null;
  const refreshDue = todayAnchor >= saturdayRefreshDate;
  const summaryState = resolveScheduleState(selectedEntries, focusedDate, todayAnchor);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
        <View style={styles.topCopy}>
          <Text style={styles.topMonth}>{formatMonthYear(focusedDate)}</Text>
          <Text style={styles.topDate}>{formatLongDate(focusedDate)}</Text>
        </View>
        <Pressable
          style={[styles.topUploadButton, uploadState === 'updated' && styles.topUploadButtonDone]}
          onPress={() => {
            setUploadState('uploading');
            setTimeout(() => setUploadState('updated'), 260);
          }}
        >
          <Text style={styles.topUploadButtonText}>
            {uploadState === 'uploading' ? 'Uploading' : uploadState === 'updated' ? 'Updated' : 'Upload'}
          </Text>
        </Pressable>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryCopy}>
            <Text style={styles.summaryLabel}>Current + Next</Text>
            <Text style={styles.summaryTitle}>
              {summaryState.currentClass || summaryState.nextClass
                ? summaryState.headline
                : 'No class running right now'}
            </Text>
          </View>
          <Text style={styles.summaryDay}>{selectedDayKey.toUpperCase()}</Text>
        </View>

        <View style={styles.summaryColumns}>
          <View style={styles.summaryColumn}>
            <Text style={styles.columnLabel}>Current</Text>
            <Text style={styles.columnTitle}>{summaryState.currentClass?.title ?? 'Free slot'}</Text>
            <Text style={styles.columnMeta}>
              {summaryState.currentClass
                ? `${summaryState.currentClass.room} • ${summaryState.currentClass.teacher}`
                : 'No active lecture right now'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryColumn}>
            <Text style={styles.columnLabel}>Next</Text>
            <Text style={styles.columnTitle}>{summaryState.nextClass?.title ?? 'No next class'}</Text>
            <Text style={styles.columnMeta}>
              {summaryState.nextClass
                ? `${summaryState.nextClass.start} - ${summaryState.nextClass.end} • ${summaryState.nextClass.room}`
                : 'Upload next week timetable on Saturday'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.refreshBanner}>
        <View style={styles.refreshBannerCopy}>
          <Text style={styles.refreshBannerTitle}>
            {uploadState === 'updated'
              ? 'Timetable updated'
              : refreshDue
                ? 'Week ready for a fresh upload'
                : 'Week ready'}
          </Text>
          <Text style={styles.refreshBannerBody}>
            {uploadState === 'updated'
              ? 'Your next screenshot is staged so Sentri can refresh the week.'
              : 'Every Saturday, upload the new screenshot when the timetable mail arrives.'}
          </Text>
        </View>
      </View>

      <View style={styles.segmentedControl}>
        {(['today', 'week', 'month'] as ViewMode[]).map((mode) => (
          <Pressable
            key={mode}
            onPress={() => setViewMode(mode)}
            style={[styles.segmentButton, viewMode === mode && styles.segmentButtonActive]}
          >
            <Text style={[styles.segmentText, viewMode === mode && styles.segmentTextActive]}>
              {mode === 'today' ? 'Today' : mode === 'week' ? 'Week' : 'Month'}
            </Text>
          </Pressable>
        ))}
      </View>

      {viewMode === 'today' ? (
        <View style={styles.section}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.dayStrip}
          >
            {weekDays.map((date) => {
              const active = isSameDate(date, focusedDate);
              const entries = scheduleByDay[dayKeyForDate(date)] || [];
              return (
                <Pressable
                  key={date.toISOString()}
                  onPress={() => {
                    setFocusedDate(date);
                    setHoveredClassId(null);
                  }}
                  style={[styles.dayCard, active && styles.dayCardActive]}
                >
                  <Text style={[styles.dayCardTop, active && styles.dayCardTopActive]}>
                    {formatWeekdayShort(date)}
                  </Text>
                  <Text style={[styles.dayCardDate, active && styles.dayCardDateActive]}>
                    {date.getDate()}
                  </Text>
                  <Text style={[styles.dayCardMeta, active && styles.dayCardMetaActive]}>
                    {entries.length ? `${entries.length} classes` : 'Free'}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Today timeline</Text>
            <Text style={styles.sectionAction}>{formatLongDate(focusedDate)}</Text>
          </View>

          {selectedEntries.length ? (
            <View style={styles.scheduleCard}>
              <View style={styles.scheduleHead}>
                <Text style={styles.scheduleCardTitle}>{formatLongDate(focusedDate)}</Text>
                <Text style={styles.scheduleCardHint}>Long press any class for the hover card.</Text>
              </View>
              <View style={styles.scheduleList}>
                {selectedEntries.map((entry, index) => (
                  <Pressable
                    key={entry.id}
                    onLongPress={() => setHoveredClassId(entry.id)}
                    onPressOut={() =>
                      setHoveredClassId((current) => (current === entry.id ? null : current))
                    }
                    delayLongPress={180}
                    style={[styles.scheduleRow, index !== 0 && styles.scheduleRowBorder]}
                  >
                    <View style={styles.scheduleTimeBlock}>
                      <Text style={styles.scheduleTime}>{entry.start}</Text>
                      <Text style={styles.scheduleTimeEnd}>{entry.end}</Text>
                    </View>
                    <View style={styles.scheduleCopy}>
                      <Text style={styles.scheduleSubject}>{entry.title}</Text>
                      <Text style={styles.scheduleMeta}>{entry.room} • {entry.teacher}</Text>
                    </View>
                    <Text style={styles.scheduleType}>{entry.type}</Text>
                  </Pressable>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing planned for this day</Text>
              <Text style={styles.emptyBody}>Tap another date in the week strip or switch to month view.</Text>
            </View>
          )}

          {hoveredClass ? (
            <View style={styles.hoverCard}>
              <Text style={styles.hoverKicker}>Class detail</Text>
              <Text style={styles.hoverTitle}>{hoveredClass.title}</Text>
              <Text style={styles.hoverBody}>
                {hoveredClass.start} - {hoveredClass.end} • {hoveredClass.room} • {hoveredClass.teacher}
              </Text>
              <Text style={styles.hoverNote}>
                {hoveredClass.note ?? 'Release your press to hide this detail preview.'}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {viewMode === 'week' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>This week</Text>
            <Text style={styles.sectionAction}>Tap a day</Text>
          </View>
          {weekDays.map((date) => {
            const entries = scheduleByDay[dayKeyForDate(date)] || [];
            return (
              <Pressable
                key={`week-${date.toISOString()}`}
                onPress={() => {
                  setFocusedDate(date);
                  setHoveredClassId(null);
                  setViewMode('today');
                }}
                style={styles.weekRow}
              >
                <View style={styles.weekDateBlock}>
                  <Text style={styles.weekDateDay}>{formatWeekdayShort(date)}</Text>
                  <Text style={styles.weekDateNumber}>{date.getDate()}</Text>
                </View>
                <View style={styles.weekSummaryBlock}>
                  <Text style={styles.weekSummaryTitle}>{entries[0]?.title ?? 'No classes'}</Text>
                  <Text style={styles.weekSummaryBody}>
                    {entries.length ? `${entries.length} timetable items` : 'Free day'}
                  </Text>
                </View>
                <Text style={styles.weekChevron}>›</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}

      {viewMode === 'month' ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{formatMonthYear(focusedDate)}</Text>
            <Text style={styles.sectionAction}>Tap a date</Text>
          </View>

          <View style={styles.weekdayRow}>
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => (
              <Text key={`${label}-${index}`} style={styles.weekdayLabel}>
                {label}
              </Text>
            ))}
          </View>

          <View style={styles.calendarGrid}>
            {monthRows.map((row, rowIndex) => (
              <View key={`month-row-${rowIndex}`} style={styles.calendarRow}>
                {row.map((cell) => {
                  const active = cell.date ? isSameDate(cell.date, focusedDate) : false;
                  return (
                    <Pressable
                      key={cell.key}
                      onPress={
                        cell.date
                          ? () => {
                              setFocusedDate(cell.date);
                              setHoveredClassId(null);
                              setViewMode('today');
                            }
                          : undefined
                      }
                      style={[
                        styles.calendarCell,
                        active && styles.calendarCellActive,
                        !cell.date && styles.calendarCellBlank,
                      ]}
                    >
                      <Text style={[styles.calendarDate, active && styles.calendarDateActive]}>
                        {cell.date ? cell.date.getDate() : ''}
                      </Text>
                      {cell.tags.slice(0, 2).map((tag) => (
                        <View key={tag.id} style={[styles.calendarTag, tagToneStyles[tag.tone]]}>
                          <Text numberOfLines={1} style={styles.calendarTagText}>
                            {tag.title}
                          </Text>
                        </View>
                      ))}
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
}

function buildWeekDates(anchor: Date) {
  const start = startOfWeek(anchor);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    return date;
  });
}

function buildMonthCells(anchor: Date) {
  const year = anchor.getFullYear();
  const month = anchor.getMonth();
  const firstDay = new Date(year, month, 1);
  const startIndex = (firstDay.getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const totalCells = Math.ceil((startIndex + daysInMonth) / 7) * 7;

  return Array.from({ length: totalCells }, (_, index) => {
    const dayNumber = index - startIndex + 1;
    if (dayNumber < 1 || dayNumber > daysInMonth) {
      return { key: `blank-${index}`, date: null, tags: [] as CalendarTag[] };
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

function buildMonthRows(anchor: Date) {
  const cells = buildMonthCells(anchor);
  const rows: ReturnType<typeof buildMonthCells>[] = [];

  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }

  return rows;
}

function resolveScheduleState(entries: ClassEntry[], focusedDate: Date, now: Date) {
  if (!entries.length) {
    return {
      currentClass: null,
      nextClass: null,
      headline: 'No timetable items',
    };
  }

  if (!isSameDate(focusedDate, now)) {
    return {
      currentClass: null,
      nextClass: entries[0] ?? null,
      headline: `First class at ${entries[0]?.start ?? '--:--'}`,
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
      currentClass,
      nextClass,
      headline: minutesLeft ? `Live now • ${minutesLeft} min left` : 'Live now',
    };
  }

  const nextIndex = entries.findIndex((entry) => toMinutes(entry.start) > minutesNow);
  if (nextIndex >= 0) {
    const nextClass = entries[nextIndex];
    const minutesUntil = Math.max(toMinutes(nextClass.start) - minutesNow, 0);

    return {
      currentClass: null,
      nextClass,
      headline: `Starts in ${minutesUntil} min`,
    };
  }

  return {
    currentClass: null,
    nextClass: null,
    headline: 'Day complete',
  };
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long', year: 'numeric' }).format(date);
}

function formatLongDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function formatWeekdayShort(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { weekday: 'short' }).format(date);
}

function startOfWeek(date: Date) {
  const result = new Date(date);
  const day = result.getDay();
  const offset = day === 0 ? -6 : 1 - day;
  result.setDate(result.getDate() + offset);
  result.setHours(0, 0, 0, 0);
  return result;
}

function dayKeyForDate(date: Date) {
  return ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
}

function isSameDate(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function dateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

const tagToneStyles = StyleSheet.create({
  accent: { backgroundColor: '#D2E3FC' },
  blue: { backgroundColor: '#E8F0FE' },
  green: { backgroundColor: '#F1F3F4' },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingTop: theme.chrome.topPadding,
    paddingBottom: theme.chrome.screenBottomInset,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  topCopy: {
    flex: 1,
    gap: 2,
  },
  topMonth: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '700',
  },
  topDate: {
    color: theme.colors.textSoft,
    fontSize: 14,
  },
  topUploadButton: {
    minWidth: 86,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topUploadButtonDone: {
    backgroundColor: theme.colors.accent,
  },
  topUploadButtonText: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '800',
  },
  summaryCard: {
    marginTop: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    ...theme.shadow.soft,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    marginBottom: 16,
  },
  summaryCopy: {
    flex: 1,
  },
  summaryLabel: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  summaryTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryDay: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '800',
    backgroundColor: theme.colors.accentSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 14,
    paddingVertical: 10,
    overflow: 'hidden',
  },
  summaryColumns: {
    flexDirection: 'row',
    gap: 16,
  },
  summaryColumn: {
    flex: 1,
    gap: 6,
  },
  summaryDivider: {
    width: 1,
    backgroundColor: theme.colors.line,
  },
  columnLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  columnTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  columnMeta: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  refreshBanner: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  refreshBannerCopy: {
    gap: 4,
  },
  refreshBannerTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  refreshBannerBody: {
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  segmentedControl: {
    marginTop: 18,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 4,
  },
  segmentButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    paddingVertical: 12,
  },
  segmentButtonActive: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  segmentText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  segmentTextActive: {
    color: theme.colors.surface,
  },
  section: {
    marginTop: 18,
  },
  dayStrip: {
    gap: 10,
    paddingRight: 4,
  },
  dayCard: {
    width: 84,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 14,
    gap: 3,
  },
  dayCardActive: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.surfaceStrong,
  },
  dayCardTop: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  dayCardTopActive: {
    color: '#D2E3FC',
  },
  dayCardDate: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  dayCardDateActive: {
    color: theme.colors.surface,
  },
  dayCardMeta: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: '600',
  },
  dayCardMetaActive: {
    color: '#D2E3FC',
  },
  sectionHeader: {
    marginTop: 18,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionAction: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  scheduleCard: {
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    padding: 18,
    ...theme.shadow.strong,
  },
  scheduleHead: {
    gap: 4,
    marginBottom: 8,
  },
  scheduleCardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
  },
  scheduleCardHint: {
    color: '#D2E3FC',
    fontSize: 13,
    lineHeight: 18,
  },
  scheduleList: {
    marginTop: 4,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingVertical: 14,
  },
  scheduleRowBorder: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.18)',
  },
  scheduleTimeBlock: {
    width: 64,
    gap: 2,
  },
  scheduleTime: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },
  scheduleTimeEnd: {
    color: '#D2E3FC',
    fontSize: 12,
    fontWeight: '600',
  },
  scheduleCopy: {
    flex: 1,
    gap: 3,
  },
  scheduleSubject: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  scheduleMeta: {
    color: '#D2E3FC',
    fontSize: 13,
    lineHeight: 18,
  },
  scheduleType: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    overflow: 'hidden',
  },
  hoverCard: {
    marginTop: 12,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    ...theme.shadow.soft,
  },
  hoverKicker: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.7,
    textTransform: 'uppercase',
  },
  hoverTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  hoverBody: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  hoverNote: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 14,
    lineHeight: 20,
  },
  emptyCard: {
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
  },
  emptyTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 6,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  weekRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 14,
    marginBottom: 12,
  },
  weekDateBlock: {
    width: 56,
    alignItems: 'center',
    gap: 2,
  },
  weekDateDay: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  weekDateNumber: {
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  weekSummaryBlock: {
    flex: 1,
    gap: 4,
  },
  weekSummaryTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  weekSummaryBody: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  weekChevron: {
    color: theme.colors.textMuted,
    fontSize: 26,
    lineHeight: 28,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    color: theme.colors.textMuted,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  calendarGrid: {
    gap: 10,
  },
  calendarRow: {
    flexDirection: 'row',
    gap: 8,
  },
  calendarCell: {
    flex: 1,
    minHeight: 88,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 8,
  },
  calendarCellActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
  },
  calendarCellBlank: {
    opacity: 0,
  },
  calendarDate: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  calendarDateActive: {
    color: theme.colors.accentStrong,
  },
  calendarTag: {
    marginTop: 6,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  calendarTagText: {
    color: theme.colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
});
