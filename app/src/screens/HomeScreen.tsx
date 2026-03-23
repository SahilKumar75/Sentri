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
      note: 'Ask the user to upload next week timetable screenshot.',
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
  const [selectedClassId, setSelectedClassId] = useState(scheduleByDay.mon[0]?.id ?? null);

  const weekDays = useMemo(() => buildWeekDates(focusedDate), [focusedDate]);
  const selectedDayKey = dayKeyForDate(focusedDate);
  const selectedEntries = scheduleByDay[selectedDayKey] || [];
  const selectedClass = selectedEntries.find((entry) => entry.id === selectedClassId) ?? selectedEntries[0] ?? null;
  const summaryState = resolveScheduleState(selectedEntries, focusedDate, todayAnchor);
  const currentClass = summaryState.currentClass;
  const nextClass = summaryState.nextClass;
  const refreshDue = todayAnchor >= saturdayRefreshDate;
  const monthRows = useMemo(() => buildMonthRows(focusedDate), [focusedDate]);
  const summaryHeadline = summaryState.headline;

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
        <View style={[styles.refreshChip, refreshDue ? styles.refreshChipUrgent : styles.refreshChipCalm]}>
          <Text style={[styles.refreshChipText, refreshDue && styles.refreshChipTextUrgent]}>
            {refreshDue ? 'Refresh due' : 'Week ready'}
          </Text>
        </View>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <View>
            <Text style={styles.summaryLabel}>Current + Next</Text>
            <Text style={styles.summaryTitle}>
              {currentClass || nextClass ? summaryHeadline : 'Nothing live right now'}
            </Text>
          </View>
          <Text style={styles.summaryDay}>{selectedDayKey.toUpperCase()}</Text>
        </View>

        <View style={styles.summaryColumns}>
          <View style={styles.summaryColumn}>
            <Text style={styles.columnLabel}>Current class</Text>
            <Text style={styles.columnTitle}>{currentClass?.title ?? 'Free slot'}</Text>
            <Text style={styles.columnMeta}>
              {currentClass ? `${currentClass.room} • ${currentClass.teacher}` : 'No active lecture now'}
            </Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryColumn}>
            <Text style={styles.columnLabel}>Next class</Text>
            <Text style={styles.columnTitle}>{nextClass?.title ?? 'No next class'}</Text>
            <Text style={styles.columnMeta}>
              {nextClass ? `${nextClass.start} - ${nextClass.end} • ${nextClass.room}` : 'Upload the next week when Saturday arrives'}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.refreshBanner}>
        <Text style={styles.refreshBannerTitle}>
          {refreshDue ? 'Upload the next timetable this Saturday' : 'Next timetable prompt comes on Saturday'}
        </Text>
        <Text style={styles.refreshBannerBody}>
          AIT sends a new weekly timetable every Saturday, so Sentri should nudge the user to refresh that screenshot.
        </Text>
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
                    setSelectedClassId((scheduleByDay[dayKeyForDate(date)] || [])[0]?.id ?? null);
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
            <View style={styles.timelineList}>
              {selectedEntries.map((entry) => {
                const selected = selectedClass?.id === entry.id;
                return (
                  <Pressable
                    key={entry.id}
                    onPress={() => setSelectedClassId(entry.id)}
                    onLongPress={() => setSelectedClassId(entry.id)}
                    style={[styles.timelineRow, selected && styles.timelineRowSelected]}
                  >
                    <View style={styles.timelineMarkerWrap}>
                      <View style={[styles.timelineDot, selected && styles.timelineDotActive]} />
                      <View style={styles.timelineLine} />
                    </View>
                    <View style={styles.timelineText}>
                      <Text style={styles.timelineSubject}>{entry.title}</Text>
                      <Text style={styles.timelineSubheading}>
                        {entry.start} - {entry.end}
                      </Text>
                      <Text style={styles.timelineMeta}>
                        {entry.room} • {entry.teacher}
                      </Text>
                    </View>
                    <View style={styles.typeBadge}>
                      <Text style={styles.typeBadgeText}>{entry.type}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing planned for this day</Text>
              <Text style={styles.emptyBody}>Tap another date in the week strip or switch to month view.</Text>
            </View>
          )}

          {selectedClass ? (
            <View style={styles.detailCard}>
              <Text style={styles.detailKicker}>Pressed detail</Text>
              <Text style={styles.detailTitle}>{selectedClass.title}</Text>
              <Text style={styles.detailBody}>
                {selectedClass.start} - {selectedClass.end} • {selectedClass.room} • {selectedClass.teacher}
              </Text>
              <Text style={styles.detailNote}>{selectedClass.note ?? 'Open until you press another class.'}</Text>
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
                  setSelectedClassId(entries[0]?.id ?? null);
                  setViewMode('today');
                }}
                style={styles.weekRow}
              >
                <View style={styles.weekDateBlock}>
                  <Text style={styles.weekDateDay}>{formatWeekdayShort(date)}</Text>
                  <Text style={styles.weekDateNumber}>{date.getDate()}</Text>
                </View>
                <View style={styles.weekSummaryBlock}>
                  <Text style={styles.weekSummaryTitle}>
                    {entries[0]?.title ?? 'No classes'}
                  </Text>
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
                              setSelectedClassId((scheduleByDay[dayKeyForDate(cell.date)] || [])[0]?.id ?? null);
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
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toMinutes(time: string) {
  const [hour, minute] = time.split(':').map(Number);
  return hour * 60 + minute;
}

const tagToneStyles = StyleSheet.create({
  accent: { backgroundColor: theme.colors.accentSoft },
  blue: { backgroundColor: theme.colors.blueSoft },
  green: { backgroundColor: theme.colors.greenSoft },
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
  refreshChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  refreshChipCalm: {
    backgroundColor: theme.colors.surfaceAlt,
  },
  refreshChipUrgent: {
    backgroundColor: theme.colors.accentSoft,
  },
  refreshChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  refreshChipTextUrgent: {
    color: theme.colors.accentStrong,
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
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  summaryLabel: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
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
    fontSize: 14,
    fontWeight: '800',
    backgroundColor: theme.colors.surfaceAlt,
    borderRadius: 999,
    overflow: 'hidden',
    paddingHorizontal: 14,
    paddingVertical: 10,
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
    borderRadius: 22,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  refreshBannerTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  refreshBannerBody: {
    marginTop: 4,
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
    width: 82,
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
    color: '#CDC3B6',
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
    color: '#D8D0C7',
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
  timelineList: {
    gap: 12,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  timelineRowSelected: {
    borderColor: theme.colors.accent,
  },
  timelineMarkerWrap: {
    alignItems: 'center',
    width: 16,
    marginTop: 2,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.line,
  },
  timelineDotActive: {
    backgroundColor: theme.colors.accent,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    minHeight: 48,
    marginTop: 6,
    backgroundColor: theme.colors.line,
  },
  timelineText: {
    flex: 1,
    gap: 3,
  },
  timelineSubject: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  timelineSubheading: {
    color: theme.colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  timelineMeta: {
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  typeBadge: {
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  typeBadgeText: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: '700',
  },
  detailCard: {
    marginTop: 14,
    borderRadius: 24,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 16,
    gap: 6,
  },
  detailKicker: {
    color: theme.colors.accentStrong,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailTitle: {
    color: theme.colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  detailBody: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  detailNote: {
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
    fontSize: 17,
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
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    marginBottom: 10,
  },
  weekDateBlock: {
    width: 54,
    alignItems: 'center',
    gap: 4,
  },
  weekDateDay: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  weekDateNumber: {
    color: theme.colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  weekSummaryBlock: {
    flex: 1,
    gap: 4,
  },
  weekSummaryTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  weekSummaryBody: {
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  weekChevron: {
    color: theme.colors.textMuted,
    fontSize: 24,
    lineHeight: 24,
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayLabel: {
    flex: 1,
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  calendarGrid: {
    gap: 8,
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
    gap: 4,
  },
  calendarCellActive: {
    borderColor: theme.colors.accent,
  },
  calendarCellBlank: {
    backgroundColor: 'transparent',
    borderColor: 'transparent',
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
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  calendarTagText: {
    color: theme.colors.text,
    fontSize: 10,
    fontWeight: '600',
  },
});
