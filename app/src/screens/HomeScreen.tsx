import { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { theme as sharedTheme } from '../design/tokens';

type ViewMode = 'today' | 'week' | 'month';
type HomeScreenState = 'ready' | 'loading' | 'error' | 'empty' | 'success';
type RefreshWorkflowState =
  | 'missing'
  | 'current-valid'
  | 'uploaded'
  | 'parsing'
  | 'needs-correction'
  | 'ready'
  | 'due';

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

type DayPlan = {
  key: string;
  label: string;
  shortLabel: string;
  events: ClassEntry[];
};

const theme = {
  background: sharedTheme.colors.background,
  surface: sharedTheme.colors.surface,
  surfaceAlt: sharedTheme.colors.surfaceAlt,
  surfaceWarm: sharedTheme.colors.surfaceAlt,
  foreground: sharedTheme.colors.text,
  muted: sharedTheme.colors.textSoft,
  soft: sharedTheme.colors.textMuted,
  accent: sharedTheme.colors.accent,
  accentSoft: sharedTheme.colors.accentSoft,
  accentDeep: sharedTheme.colors.accentStrong,
  blueSoft: sharedTheme.colors.blueSoft,
  blue: sharedTheme.colors.blue,
  greenSoft: sharedTheme.colors.greenSoft,
  green: sharedTheme.colors.green,
  line: sharedTheme.colors.line,
  shadow: 'rgba(41, 23, 10, 0.08)',
};

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const timelineData: Record<string, ClassEntry[]> = {
  mon: [
    {
      id: 'mon-1',
      title: 'DBMS',
      teacher: 'Prof. Deshmukh',
      room: 'LH 19',
      start: '08:45',
      end: '09:45',
      type: 'Lecture',
      note: 'Current focus on parallel database basics.',
    },
    {
      id: 'mon-2',
      title: 'Project Management',
      teacher: 'Dr. Kulkarni',
      room: 'LH 20',
      start: '09:50',
      end: '10:45',
      type: 'Lecture',
      note: 'Stand-up notes and sprint planning.',
    },
    {
      id: 'mon-3',
      title: 'DBMS Lab',
      teacher: 'Prof. Deshmukh',
      room: 'VI Lab',
      start: '11:00',
      end: '12:45',
      type: 'Lab',
      note: 'Submission deadline for Assignment 7.',
    },
    {
      id: 'mon-4',
      title: 'Probability & Statistics',
      teacher: 'Prof. Shah',
      room: 'LH 18',
      start: '13:45',
      end: '14:45',
      type: 'Tutorial',
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
    },
    {
      id: 'tue-3',
      title: 'E-Commerce',
      teacher: 'Prof. Ghule',
      room: 'Tut Room',
      start: '12:45',
      end: '13:45',
      type: 'Tutorial',
      note: 'Hackathon registration reminder.',
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
      note: 'Job interview drive in the afternoon.',
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
      note: 'College holiday',
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
    },
  ],
  sat: [
    {
      id: 'sat-1',
      title: 'Hackathon Registration',
      teacher: 'AIT',
      room: 'Online',
      start: '10:00',
      end: '10:15',
      type: 'Deadline',
      note: 'Deadline reminder from the calendar grid.',
    },
  ],
  sun: [],
};

const monthGrid: Array<{ key: string; dateLabel: string; event: string; kind: 'class' | 'exam' | 'deadline' | 'note' | 'empty' }> = [
  { key: '1', dateLabel: '1', event: 'DBMS Exam', kind: 'exam' },
  { key: '2', dateLabel: '2', event: 'Project review', kind: 'note' },
  { key: '3', dateLabel: '3', event: 'Placement drive', kind: 'class' },
  { key: '4', dateLabel: '4', event: 'Hackathon reg.', kind: 'deadline' },
  { key: '5', dateLabel: '5', event: 'Workshop', kind: 'note' },
  { key: '6', dateLabel: '6', event: 'CG lab', kind: 'class' },
  { key: '7', dateLabel: '7', event: 'Free', kind: 'empty' },
  { key: '8', dateLabel: '8', event: 'P&S test', kind: 'exam' },
  { key: '9', dateLabel: '9', event: 'DBMS viva', kind: 'class' },
  { key: '10', dateLabel: '10', event: 'Deadline', kind: 'deadline' },
  { key: '11', dateLabel: '11', event: 'Interview', kind: 'class' },
  { key: '12', dateLabel: '12', event: 'Holiday', kind: 'note' },
  { key: '13', dateLabel: '13', event: 'OS assignment', kind: 'deadline' },
  { key: '14', dateLabel: '14', event: 'Team meet', kind: 'note' },
  { key: '15', dateLabel: '15', event: 'CG exam', kind: 'exam' },
  { key: '16', dateLabel: '16', event: 'Placement prep', kind: 'class' },
  { key: '17', dateLabel: '17', event: 'Lab submission', kind: 'deadline' },
  { key: '18', dateLabel: '18', event: 'Seminar', kind: 'note' },
  { key: '19', dateLabel: '19', event: 'Free', kind: 'empty' },
  { key: '20', dateLabel: '20', event: 'DBMS practical', kind: 'class' },
  { key: '21', dateLabel: '21', event: 'Interview', kind: 'class' },
  { key: '22', dateLabel: '22', event: 'Hackathon', kind: 'deadline' },
  { key: '23', dateLabel: '23', event: 'Today', kind: 'class' },
  { key: '24', dateLabel: '24', event: 'P&S exam', kind: 'exam' },
  { key: '25', dateLabel: '25', event: 'Holiday', kind: 'note' },
  { key: '26', dateLabel: '26', event: 'Assignment', kind: 'deadline' },
  { key: '27', dateLabel: '27', event: 'Guest lecture', kind: 'note' },
  { key: '28', dateLabel: '28', event: 'Lab', kind: 'class' },
  { key: '29', dateLabel: '29', event: 'Placement drive', kind: 'class' },
  { key: '30', dateLabel: '30', event: 'Revision', kind: 'note' },
];

const monthWeekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

const weekOverview = [
  { day: 'Mon', label: 'DBMS Lab', tint: 'blue' },
  { day: 'Tue', label: 'Lecture stack', tint: 'green' },
  { day: 'Wed', label: 'Lab-heavy', tint: 'amber' },
  { day: 'Thu', label: 'Holiday', tint: 'soft' },
  { day: 'Fri', label: 'Exam prep', tint: 'amber' },
  { day: 'Sat', label: 'Refresh week', tint: 'blue' },
  { day: 'Sun', label: 'Light day', tint: 'soft' },
] as const;

const saturdayRefreshDate = new Date('2026-03-28T00:00:00');

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date);
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

function buildDaysForWeek(anchor: Date): DayPlan[] {
  const start = startOfWeek(anchor);
  return weekDays.map((shortLabel, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = dayKeyForDate(date);
    return {
      key,
      label: formatDateLabel(date),
      shortLabel,
      events: timelineData[key] || [],
    };
  });
}

function buildMonthRows() {
  const slots = [
    ...monthGrid,
    ...Array.from({ length: 12 }, (_, index) => ({
      key: `blank-${index}`,
      dateLabel: '',
      event: '',
      kind: 'empty' as const,
    })),
  ];
  const rows: typeof slots[] = [];
  for (let index = 0; index < slots.length; index += 7) {
    rows.push(slots.slice(index, index + 7));
  }
  return rows;
}

export default function HomeScreen() {
  const [viewMode, setViewMode] = useState<ViewMode>('today');
  const [focusedDate, setFocusedDate] = useState(new Date());
  const [selectedClassId, setSelectedClassId] = useState<string | null>(
    timelineData.mon[0]?.id ?? null
  );
  const [screenState] = useState<HomeScreenState>('ready');
  const refreshStateKey: RefreshWorkflowState = new Date() >= saturdayRefreshDate ? 'due' : 'ready';

  const weekPlans = useMemo(() => buildDaysForWeek(focusedDate), [focusedDate]);
  const currentDayKey = dayKeyForDate(focusedDate);
  const currentDayLabel = formatDateLabel(focusedDate);
  const selectedEntries = timelineData[currentDayKey] || [];
  const selectedClass = selectedEntries.find((item) => item.id === selectedClassId) || selectedEntries[0] || null;
  const currentClass = selectedEntries[0] || null;
  const nextClass = selectedEntries[1] || selectedEntries[0] || null;
  const refreshState = buildRefreshState(refreshStateKey);

  if (screenState !== 'ready') {
    return <HomeStatePanel state={screenState} />;
  }

  return (
    <View style={styles.screen}>
      <View style={styles.headerBlock}>
        <Text style={styles.kicker}>Sentri for AIT</Text>
        <Text style={styles.title}>Home</Text>
        <Text style={styles.subtitle}>Your day, week, and month in one calm view.</Text>
      </View>

      <View style={styles.surfaceStack}>
        <View style={styles.profileRow}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>SK</Text>
          </View>
          <View style={styles.profileMeta}>
            <Text style={styles.profileLabel}>Today</Text>
            <Text style={styles.profileValue}>{currentDayLabel}</Text>
          </View>
          <View style={[styles.refreshBadge, refreshState.badgeStyle]}>
            <Text style={[styles.refreshBadgeText, refreshState.textStyle]}>{refreshState.label}</Text>
          </View>
        </View>

        <View style={styles.nowNextCard}>
          <View style={styles.nowNextHeader}>
            <View>
              <Text style={styles.nowNextKicker}>Current + Next</Text>
              <Text style={styles.nowNextTime}>Starts in 5 min</Text>
            </View>
            <View style={styles.nowNextChip}>
              <Text style={styles.nowNextChipText}>{currentDayKey.toUpperCase()}</Text>
            </View>
          </View>

          <View style={styles.nowNextBody}>
            <View style={styles.nowBlock}>
              <Text style={styles.blockLabel}>Current class</Text>
              <Text style={styles.blockTitle}>{currentClass?.title ?? 'No class right now'}</Text>
              <Text style={styles.blockMeta}>
                {currentClass ? `${currentClass.room}  •  ${currentClass.teacher}` : 'Sit tight for the next session.'}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.nextBlock}>
              <Text style={styles.blockLabel}>Next class</Text>
              <Text style={styles.blockTitle}>{nextClass?.title ?? 'Nothing scheduled'}</Text>
              <Text style={styles.blockMeta}>
                {nextClass ? `${nextClass.start} - ${nextClass.end}  •  ${nextClass.room}` : 'Fresh timetable needed.'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.modeStrip}>
          {(['today', 'week', 'month'] as ViewMode[]).map((mode) => (
            <Pressable
              key={mode}
              onPress={() => setViewMode(mode)}
              style={[styles.modeButton, viewMode === mode && styles.modeButtonActive]}
            >
              <Text style={[styles.modeButtonText, viewMode === mode && styles.modeButtonTextActive]}>
                {mode === 'today' ? 'Today' : mode === 'week' ? 'Week' : 'Month'}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.freshnessCard}>
          <View>
            <Text style={styles.sectionLabel}>Weekly timetable freshness</Text>
            <Text style={styles.sectionTitle}>{refreshState.label}</Text>
            <Text style={styles.sectionBody}>{refreshState.detail}</Text>
          </View>
          <View style={styles.freshnessAction}>
            <Text style={styles.freshnessActionText}>{refreshState.actionLabel}</Text>
          </View>
        </View>

        {viewMode === 'today' && (
          <View style={styles.modePanel}>
            <SectionHeader title="Today timeline" action={currentDayLabel} />
            <View style={styles.timelineRail}>
              {selectedEntries.map((entry, index) => (
                <TimelineRow
                  key={entry.id}
                  entry={entry}
                  index={index}
                  selected={selectedClass?.id === entry.id}
                  onPress={() => setSelectedClassId(entry.id)}
                  onLongPress={() => setSelectedClassId(entry.id)}
                />
              ))}
            </View>
            {selectedClass && <DetailCard entry={selectedClass} dateLabel={currentDayLabel} />}
          </View>
        )}

        {viewMode === 'week' && (
          <View style={styles.modePanel}>
            <SectionHeader title="Week overview" action="Swipe between dates" />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekStrip}>
              {weekPlans.map((day, index) => (
                <Pressable
                  key={day.key}
                  onPress={() => {
                    setFocusedDate((prev) => {
                      const next = new Date(startOfWeek(prev));
                      next.setDate(next.getDate() + index);
                      return next;
                    });
                    setViewMode('today');
                    setSelectedClassId((timelineData[day.key]?.[0]?.id) ?? null);
                  }}
                  style={styles.weekCard}
                >
                  <Text style={styles.weekDay}>{day.shortLabel}</Text>
                  <Text style={styles.weekDate}>{day.label.split(', ')[1] ?? day.label}</Text>
                  <View style={styles.weekPill}>
                    <Text style={styles.weekPillText}>{day.events.length ? `${day.events.length} items` : 'Free'}</Text>
                  </View>
                </Pressable>
              ))}
            </ScrollView>
            <View style={styles.weekSummary}>
              {weekOverview.map((item) => (
                <View key={item.day} style={styles.weekSummaryRow}>
                  <Text style={styles.weekSummaryDay}>{item.day}</Text>
                  <View style={[styles.weekSummaryBar, tintStyles[item.tint]]}>
                    <Text style={styles.weekSummaryLabel}>{item.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {viewMode === 'month' && (
          <View style={styles.modePanel}>
            <SectionHeader title="Month calendar" action="Tap a date" />
            <View style={styles.monthWeekRow}>
              {monthWeekLabels.map((label) => (
                <Text key={label} style={styles.monthWeekLabel}>
                  {label}
                </Text>
              ))}
            </View>
            <View style={styles.monthGrid}>
              {buildMonthRows().map((row, rowIndex) => (
                <View key={`row-${rowIndex}`} style={styles.monthRow}>
                  {row.map((cell) => (
                    <Pressable
                      key={cell.key}
                      onPress={
                        cell.dateLabel
                          ? () => {
                              const focusedDay = new Date(focusedDate);
                              focusedDay.setDate(Number(cell.dateLabel));
                              setFocusedDate(focusedDay);
                              setViewMode('today');
                              const key = dayKeyForDate(focusedDay);
                              setSelectedClassId(timelineData[key]?.[0]?.id ?? null);
                            }
                          : undefined
                      }
                      style={({ pressed }) => [
                        styles.monthCell,
                        cell.kind === 'exam' && styles.monthCellExam,
                        !cell.dateLabel && styles.monthCellBlank,
                        pressed && cell.dateLabel && styles.monthCellPressed,
                      ]}
                    >
                      <Text style={[styles.monthCellDate, !cell.dateLabel && styles.monthCellBlankText]}>
                        {cell.dateLabel}
                      </Text>
                      <Text style={[styles.monthCellEvent, !cell.dateLabel && styles.monthCellBlankText]} numberOfLines={2}>
                        {cell.event}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              ))}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

function buildRefreshState(state: RefreshWorkflowState) {
  const config = {
    'current-valid': {
      label: 'Current week valid',
      detail: 'This week is active and reminders can stay on until the Saturday refresh prompt arrives.',
      actionLabel: 'View current week',
      badgeStyle: styles.refreshCalm,
      textStyle: styles.refreshCalmText,
    },
    ready: {
      label: 'Week ready',
      detail: 'Current week valid. Saturday prompt is scheduled for the next upload.',
      actionLabel: 'Set Saturday prompt',
      badgeStyle: styles.refreshCalm,
      textStyle: styles.refreshCalmText,
    },
    due: {
      label: 'Update timetable',
      detail: 'AIT sends a fresh timetable on Saturday. Ask for the next screenshot now.',
      actionLabel: 'Refresh now',
      badgeStyle: styles.refreshUrgent,
      textStyle: styles.refreshUrgentText,
    },
    parsing: {
      label: 'Parsing upload',
      detail: 'The latest screenshot is in progress. Wait for extraction to finish.',
      actionLabel: 'Review progress',
      badgeStyle: styles.refreshCalm,
      textStyle: styles.refreshCalmText,
    },
    'needs-correction': {
      label: 'Needs correction',
      detail: 'Extraction found conflicts. Review the imported schedule before saving it.',
      actionLabel: 'Review extracted week',
      badgeStyle: styles.refreshUrgent,
      textStyle: styles.refreshUrgentText,
    },
    uploaded: {
      label: 'Uploaded',
      detail: 'A new screenshot is uploaded and waiting to be confirmed for next week.',
      actionLabel: 'Confirm week',
      badgeStyle: styles.refreshCalm,
      textStyle: styles.refreshCalmText,
    },
    missing: {
      label: 'No timetable yet',
      detail: 'Import this week’s timetable screenshot to start reminders and timeline views.',
      actionLabel: 'Upload timetable',
      badgeStyle: styles.refreshUrgent,
      textStyle: styles.refreshUrgentText,
    },
  } as const;

  return config[state];
}

function HomeStatePanel({ state }: { state: Exclude<HomeScreenState, 'ready'> }) {
  const copy = {
    loading: {
      title: 'Loading your day',
      body: 'Sentri is preparing your current class, timeline, and freshness state.',
    },
    error: {
      title: 'Home needs attention',
      body: 'We could not load the timetable right now. Try again after reconnecting.',
    },
    empty: {
      title: 'No timetable imported yet',
      body: 'Upload this week’s screenshot to unlock current class, timeline, and reminders.',
    },
    success: {
      title: 'Week imported',
      body: 'The latest timetable is saved and ready for the Today, Week, and Month views.',
    },
  } as const;

  const content = copy[state];

  return (
    <View style={styles.statePanel}>
      <Text style={styles.kicker}>Sentri for AIT</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.body}</Text>
    </View>
  );
}

function TimelineRow({
  entry,
  index,
  selected,
  onPress,
  onLongPress,
}: {
  entry: ClassEntry;
  index: number;
  selected: boolean;
  onPress: () => void;
  onLongPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.timelineRow,
        selected && styles.timelineRowSelected,
        pressed && styles.timelineRowPressed,
      ]}
    >
      <View style={styles.timelineMarkerColumn}>
        <View style={[styles.timelineDot, index === 0 && styles.timelineDotActive]} />
        <View style={styles.timelineLine} />
      </View>
      <View style={styles.timelineContent}>
        <View style={styles.timelineHeaderRow}>
          <Text style={styles.timelineTitle}>{entry.title}</Text>
          <Text style={styles.timelineType}>{entry.type}</Text>
        </View>
        <Text style={styles.timelineSubheading}>
          {entry.start} - {entry.end}  •  {entry.room}
        </Text>
        <Text style={styles.timelineTeacher}>{entry.teacher}</Text>
        {entry.note ? <Text style={styles.timelineNote}>{entry.note}</Text> : null}
      </View>
    </Pressable>
  );
}

function DetailCard({ entry, dateLabel }: { entry: ClassEntry; dateLabel: string }) {
  return (
    <View style={styles.detailCard}>
      <View style={styles.detailCardHeader}>
        <View>
          <Text style={styles.detailKicker}>Pressed detail</Text>
          <Text style={styles.detailTitle}>{entry.title}</Text>
          <Text style={styles.detailSubheading}>{dateLabel}</Text>
        </View>
        <View style={styles.detailBadge}>
          <Text style={styles.detailBadgeText}>{entry.type}</Text>
        </View>
      </View>

      <View style={styles.detailMetaGrid}>
        <DetailMeta label="Time" value={`${entry.start} - ${entry.end}`} />
        <DetailMeta label="Room" value={entry.room} />
        <DetailMeta label="Teacher" value={entry.teacher} />
        <DetailMeta label="Focus" value={entry.note ?? 'Open for more details'} />
      </View>
    </View>
  );
}

function DetailMeta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailMeta}>
      <Text style={styles.detailMetaLabel}>{label}</Text>
      <Text style={styles.detailMetaValue}>{value}</Text>
    </View>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <Text style={styles.sectionHeaderAction}>{action}</Text>
    </View>
  );
}

const tintStyles = {
  soft: { backgroundColor: theme.surfaceAlt },
  blue: { backgroundColor: theme.blueSoft },
  green: { backgroundColor: theme.greenSoft },
  amber: { backgroundColor: theme.accentSoft },
} as const;

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 18,
    paddingTop: 16,
  },
  statePanel: {
    flex: 1,
    backgroundColor: theme.background,
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 10,
  },
  headerBlock: {
    marginBottom: 14,
  },
  kicker: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: theme.foreground,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  subtitle: {
    marginTop: 6,
    color: theme.muted,
    fontSize: 15,
    lineHeight: 21,
  },
  surfaceStack: {
    flex: 1,
    gap: 14,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: theme.foreground,
    fontSize: 14,
    fontWeight: '800',
  },
  profileMeta: {
    flex: 1,
  },
  profileLabel: {
    color: theme.soft,
    fontSize: 12,
    fontWeight: '700',
  },
  profileValue: {
    marginTop: 2,
    color: theme.foreground,
    fontSize: 18,
    fontWeight: '800',
  },
  refreshBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  refreshCalm: {
    backgroundColor: theme.surface,
    borderColor: theme.line,
  },
  refreshUrgent: {
    backgroundColor: theme.accentSoft,
    borderColor: 'rgba(241, 108, 61, 0.22)',
  },
  refreshBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  refreshCalmText: {
    color: theme.foreground,
  },
  refreshUrgentText: {
    color: theme.accentDeep,
  },
  nowNextCard: {
    borderRadius: 28,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 16,
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  nowNextHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  nowNextKicker: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  nowNextTime: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 24,
    fontWeight: '800',
  },
  nowNextChip: {
    backgroundColor: theme.surfaceWarm,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
  },
  nowNextChipText: {
    color: theme.accentDeep,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
  },
  nowNextBody: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  nowBlock: {
    flex: 1,
  },
  nextBlock: {
    flex: 1,
  },
  divider: {
    width: 1,
    marginHorizontal: 12,
    backgroundColor: theme.line,
  },
  blockLabel: {
    color: theme.soft,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  blockTitle: {
    color: theme.foreground,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 26,
  },
  blockMeta: {
    marginTop: 6,
    color: theme.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  modeStrip: {
    flexDirection: 'row',
    gap: 8,
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.55)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.line,
  },
  modeButton: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.foreground,
  },
  modeButtonText: {
    color: theme.muted,
    fontSize: 14,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: '#FFF9F3',
  },
  freshnessCard: {
    borderRadius: 24,
    backgroundColor: theme.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionLabel: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  sectionTitle: {
    marginTop: 5,
    color: theme.foreground,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionBody: {
    marginTop: 6,
    color: theme.muted,
    fontSize: 13,
    lineHeight: 19,
  },
  freshnessAction: {
    alignSelf: 'flex-start',
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.line,
  },
  freshnessActionText: {
    color: theme.foreground,
    fontSize: 12,
    fontWeight: '800',
  },
  workflowRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  workflowPill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.surface,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  workflowPillActive: {
    borderColor: theme.accent,
    backgroundColor: theme.accentSoft,
  },
  workflowPillText: {
    color: theme.muted,
    fontSize: 12,
    fontWeight: '700',
  },
  workflowPillTextActive: {
    color: theme.accentDeep,
  },
  modePanel: {
    gap: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionHeaderTitle: {
    color: theme.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionHeaderAction: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '700',
  },
  timelineRail: {
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    gap: 12,
    borderRadius: 24,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 14,
  },
  timelineRowPressed: {
    backgroundColor: theme.surfaceWarm,
  },
  timelineRowSelected: {
    borderColor: 'rgba(241, 108, 61, 0.32)',
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  timelineMarkerColumn: {
    width: 14,
    alignItems: 'center',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.line,
  },
  timelineDotActive: {
    backgroundColor: theme.accent,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    marginTop: 4,
    backgroundColor: theme.line,
    borderRadius: 999,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  timelineTitle: {
    color: theme.foreground,
    fontSize: 19,
    fontWeight: '800',
    flex: 1,
  },
  timelineType: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  timelineSubheading: {
    marginTop: 4,
    color: theme.soft,
    fontSize: 13,
    fontWeight: '700',
  },
  timelineTeacher: {
    marginTop: 6,
    color: theme.muted,
    fontSize: 13,
  },
  timelineNote: {
    marginTop: 6,
    color: theme.accentDeep,
    fontSize: 12,
    lineHeight: 18,
  },
  detailCard: {
    borderRadius: 26,
    backgroundColor: theme.foreground,
    padding: 16,
  },
  detailCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'flex-start',
  },
  detailKicker: {
    color: '#D7C8B9',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  detailTitle: {
    marginTop: 6,
    color: '#FFF9F3',
    fontSize: 26,
    fontWeight: '800',
  },
  detailSubheading: {
    marginTop: 4,
    color: '#D6C6B5',
    fontSize: 13,
  },
  detailBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  detailBadgeText: {
    color: '#FFF9F3',
    fontSize: 12,
    fontWeight: '800',
  },
  detailMetaGrid: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  detailMeta: {
    width: '48%',
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    padding: 12,
  },
  detailMetaLabel: {
    color: '#D7C8B9',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  detailMetaValue: {
    marginTop: 6,
    color: '#FFF9F3',
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  weekStrip: {
    gap: 10,
    paddingVertical: 4,
  },
  weekCard: {
    width: 108,
    borderRadius: 22,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 12,
  },
  weekDay: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  weekDate: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 14,
    fontWeight: '800',
  },
  weekPill: {
    marginTop: 10,
    borderRadius: 999,
    backgroundColor: theme.surfaceWarm,
    paddingVertical: 6,
    alignItems: 'center',
  },
  weekPillText: {
    color: theme.accentDeep,
    fontSize: 11,
    fontWeight: '800',
  },
  weekSummary: {
    gap: 8,
  },
  weekSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weekSummaryDay: {
    width: 32,
    color: theme.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  weekSummaryBar: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  weekSummaryLabel: {
    color: theme.foreground,
    fontSize: 13,
    fontWeight: '700',
  },
  monthGrid: {
    gap: 8,
  },
  monthWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  monthWeekLabel: {
    flex: 1,
    color: theme.soft,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  monthRow: {
    flexDirection: 'row',
    gap: 8,
  },
  monthCell: {
    flex: 1,
    minHeight: 82,
    borderRadius: 18,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 10,
  },
  monthCellExam: {
    borderColor: 'rgba(241, 108, 61, 0.28)',
    backgroundColor: '#FFF4EE',
  },
  monthCellBlank: {
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  monthCellPressed: {
    borderColor: 'rgba(241, 108, 61, 0.32)',
    backgroundColor: theme.surfaceWarm,
  },
  monthCellDate: {
    color: theme.soft,
    fontSize: 12,
    fontWeight: '800',
  },
  monthCellEvent: {
    marginTop: 8,
    color: theme.foreground,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
  },
  monthCellBlankText: {
    color: 'rgba(135, 122, 111, 0.55)',
  },
});
