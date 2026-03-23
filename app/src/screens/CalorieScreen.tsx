import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { theme as sharedTheme } from '../design/tokens';

type GoalMode = 'lose' | 'maintain' | 'bulk';
type CheatPattern = 'Friday' | 'Saturday' | 'Sunday' | 'Two days/week';
type CalorieScreenState = 'ready' | 'loading' | 'error' | 'empty' | 'success';

type MacroKey = 'protein' | 'carbs' | 'fats';
type BurnType = 'gym' | 'run' | 'walk' | 'cycling';

type Meal = {
  label: string;
  calories: number;
  protein: number;
  note: string;
  time: string;
};

type BurnEntry = {
  label: string;
  minutes: number;
  calories: number;
  type: BurnType;
};

type TrendPoint = {
  day: string;
  intake: number;
  target: number;
};

const theme = {
  bg: sharedTheme.colors.background,
  card: sharedTheme.colors.surface,
  mutedCard: sharedTheme.colors.surfaceAlt,
  text: sharedTheme.colors.text,
  subtext: sharedTheme.colors.textSoft,
  line: sharedTheme.colors.line,
  accent: sharedTheme.colors.accent,
  accentSoft: sharedTheme.colors.accentSoft,
  green: sharedTheme.colors.green,
  greenSoft: sharedTheme.colors.greenSoft,
  blue: sharedTheme.colors.blue,
  blueSoft: sharedTheme.colors.blueSoft,
  amber: sharedTheme.colors.amber,
  amberSoft: sharedTheme.colors.amberSoft,
  shadow: 'rgba(39, 24, 16, 0.08)',
};

const profileSnapshot = {
  age: 21,
  height: `176 cm`,
  weight: `72 kg`,
  waist: `32 in`,
  thigh: `21 in`,
  neck: `15 in`,
  bodyType: 'Lean',
  goalMode: 'bulk' as GoalMode,
  idealBodyType: 'Athletic',
  goalWeight: `78 kg`,
  journeyDuration: '3 months',
  dailyTarget: 2680,
  currentIntake: 1890,
  caloriesBurned: 420,
  cheatPattern: 'Friday' as CheatPattern,
};

const macros = [
  { key: 'protein' as const, label: 'Protein', value: 124, goal: 160, tint: 'green' },
  { key: 'carbs' as const, label: 'Carbs', value: 212, goal: 320, tint: 'blue' },
  { key: 'fats' as const, label: 'Fats', value: 61, goal: 84, tint: 'amber' },
] satisfies Array<{
  key: MacroKey;
  label: string;
  value: number;
  goal: number;
  tint: 'green' | 'blue' | 'amber';
}>;

const meals: Meal[] = [
  {
    label: 'Breakfast',
    calories: 480,
    protein: 23,
    note: 'Poha, eggs, milk, and peanut butter toast',
    time: '08:40',
  },
  {
    label: 'Lunch',
    calories: 665,
    protein: 34,
    note: 'Rice, dal, paneer bhurji, curd',
    time: '13:15',
  },
  {
    label: 'Snack',
    calories: 245,
    protein: 17,
    note: 'Banana, whey shake, and roasted chana',
    time: '17:30',
  },
  {
    label: 'Dinner',
    calories: 500,
    protein: 31,
    note: 'Chapati, chicken curry, and salad',
    time: '20:45',
  },
];

const burns: BurnEntry[] = [
  { label: 'Chest workout', minutes: 58, calories: 220, type: 'gym' },
  { label: 'Evening walk', minutes: 34, calories: 96, type: 'walk' },
  { label: 'Cycling', minutes: 22, calories: 104, type: 'cycling' },
];

const trend: TrendPoint[] = [
  { day: 'Mon', intake: 2520, target: 2680 },
  { day: 'Tue', intake: 2710, target: 2680 },
  { day: 'Wed', intake: 2440, target: 2680 },
  { day: 'Thu', intake: 2590, target: 2680 },
  { day: 'Fri', intake: 2790, target: 2680 },
  { day: 'Sat', intake: 2660, target: 2680 },
  { day: 'Sun', intake: 2480, target: 2680 },
];

export default function CalorieScreen() {
  const [mode, setMode] = useState<GoalMode>(profileSnapshot.goalMode);
  const [screenState] = useState<CalorieScreenState>('ready');
  const remaining = profileSnapshot.dailyTarget - profileSnapshot.currentIntake + profileSnapshot.caloriesBurned;
  const intakeProgress = Math.min(profileSnapshot.currentIntake / profileSnapshot.dailyTarget, 1);

  if (screenState !== 'ready') {
    return <CalorieStatePanel state={screenState} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.backdropA} />
      <View style={styles.backdropB} />

      <View style={styles.hero}>
        <View>
          <Text style={styles.eyebrow}>Apple Health inspired</Text>
          <Text style={styles.title}>Calorie</Text>
          <Text style={styles.subtitle}>
            Calm tracking for student meals, gym work, and a goal that actually fits your journey.
          </Text>
        </View>

        <View style={styles.summaryRing}>
          <Text style={styles.ringCaption}>Remaining</Text>
          <Text style={styles.ringValue}>{remaining}</Text>
          <Text style={styles.ringUnit}>kcal today</Text>
        </View>
      </View>

      <Card style={styles.profileCard}>
        <SectionHeader title="Your starting point" caption="Onboarding snapshot" />
        <View style={styles.profileGrid}>
          <ProfileField label="Age" value={`${profileSnapshot.age}`} />
          <ProfileField label="Height" value={profileSnapshot.height} />
          <ProfileField label="Weight" value={profileSnapshot.weight} />
          <ProfileField label="Body type" value={profileSnapshot.bodyType} />
          <ProfileField label="Goal weight" value={profileSnapshot.goalWeight} />
          <ProfileField label="Journey" value={profileSnapshot.journeyDuration} />
        </View>
        <View style={styles.goalRow}>
          <GoalChip active={mode === 'lose'} label="Lose" onPress={() => setMode('lose')} />
          <GoalChip active={mode === 'maintain'} label="Maintain" onPress={() => setMode('maintain')} />
          <GoalChip active={mode === 'bulk'} label="Bulk" onPress={() => setMode('bulk')} />
        </View>
        <View style={styles.goalDetail}>
          <Text style={styles.goalDetailTitle}>Goal mode: {mode}</Text>
          <Text style={styles.goalDetailBody}>
            Daily target set to {profileSnapshot.dailyTarget} kcal for a {profileSnapshot.journeyDuration} runway toward {profileSnapshot.goalWeight}.
          </Text>
        </View>
      </Card>

      <Card>
        <SectionHeader title="Today" caption="Summary" />
        <View style={styles.summaryGrid}>
          <StatTile label="Consumed" value={profileSnapshot.currentIntake} unit="kcal" tint="amber" />
          <StatTile label="Burned" value={profileSnapshot.caloriesBurned} unit="kcal" tint="green" />
          <StatTile label="Target" value={profileSnapshot.dailyTarget} unit="kcal" tint="blue" />
        </View>
        <ProgressBar value={intakeProgress} />
        <Text style={styles.progressCopy}>
          You are <Text style={styles.progressHighlight}>{remaining} kcal</Text> away from target after manual exercise is applied.
        </Text>
      </Card>

      <Card>
        <SectionHeader title="Macros" caption="Daily breakdown" />
        <View style={styles.macroStack}>
          {macros.map((macro) => {
            const ratio = Math.min(macro.value / macro.goal, 1);
            return (
              <MacroRow
                key={macro.key}
                label={macro.label}
                value={macro.value}
                goal={macro.goal}
                tint={macro.tint}
                ratio={ratio}
              />
            );
          })}
        </View>
      </Card>

      <Card>
        <SectionHeader title="Meals" caption="Ledger style" />
        <View style={styles.quickActions}>
          <ActionPill label="Add meal" />
          <ActionPill label="Repeat last" />
          <ActionPill label="Add staple" />
        </View>
        <View style={styles.mealList}>
          {meals.map((meal) => (
            <MealRow key={meal.label} meal={meal} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionHeader title="Calories burned" caption="Manual and tracked" />
        <View style={styles.quickActions}>
          <ActionPill label="Log workout" />
          <ActionPill label="Log walk" />
          <ActionPill label="Add custom burn" />
        </View>
        <View style={styles.burnList}>
          {burns.map((burn) => (
            <BurnRow key={burn.label} burn={burn} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionHeader title="Weekly trend" caption="Simple and readable" />
        <View style={styles.trendWrap}>
          {trend.map((point) => (
            <TrendBar key={point.day} point={point} />
          ))}
        </View>
        <View style={styles.trendLegend}>
          <LegendDot tint="amber" label="Intake" />
          <LegendDot tint="blue" label="Target" />
        </View>
      </Card>

      <Card>
        <SectionHeader title="Cheat days" caption="Plan the flex" />
        <Text style={styles.cardBody}>
          Cheat day pattern: <Text style={styles.inlineStrong}>{profileSnapshot.cheatPattern}</Text>
        </Text>
        <View style={styles.cheatRow}>
          <CheatChip active label="Friday" />
          <CheatChip label="Saturday" />
          <CheatChip label="Sunday" />
          <CheatChip label="2 days/week" />
        </View>
        <Text style={styles.cardBody}>
          This keeps the app practical for real student life instead of treating every day like a perfect spreadsheet.
        </Text>
      </Card>
    </ScrollView>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function SectionHeader({ title, caption }: { title: string; caption: string }) {
  return (
    <View style={styles.sectionHeader}>
      <View>
        <Text style={styles.sectionCaption}>{caption}</Text>
        <Text style={styles.sectionTitle}>{title}</Text>
      </View>
    </View>
  );
}

function ProfileField({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.profileField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </View>
  );
}

function GoalChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.goalChip, active && styles.goalChipActive]}>
      <Text style={[styles.goalChipText, active && styles.goalChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function StatTile({
  label,
  value,
  unit,
  tint,
}: {
  label: string;
  value: number;
  unit: string;
  tint: 'amber' | 'green' | 'blue';
}) {
  const background =
    tint === 'green' ? theme.greenSoft : tint === 'blue' ? theme.blueSoft : theme.amberSoft;
  const textColor = tint === 'green' ? theme.green : tint === 'blue' ? theme.blue : theme.amber;

  return (
    <View style={[styles.statTile, { backgroundColor: background }]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color: textColor }]}>{value}</Text>
      <Text style={styles.statUnit}>{unit}</Text>
    </View>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <View style={styles.progressTrack}>
      <View style={[styles.progressFill, { width: `${Math.max(value * 100, 10)}%` }]} />
    </View>
  );
}

function ActionPill({ label }: { label: string }) {
  return (
    <Pressable style={styles.actionPill}>
      <Text style={styles.actionPillText}>{label}</Text>
    </Pressable>
  );
}

function MacroRow({
  label,
  value,
  goal,
  tint,
  ratio,
}: {
  label: string;
  value: number;
  goal: number;
  tint: 'green' | 'blue' | 'amber';
  ratio: number;
}) {
  const background = tint === 'green' ? theme.greenSoft : tint === 'blue' ? theme.blueSoft : theme.amberSoft;
  const fill = tint === 'green' ? theme.green : tint === 'blue' ? theme.blue : theme.amber;

  return (
    <View style={styles.macroRow}>
      <View style={styles.macroHeader}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValueText}>
          {value}g <Text style={styles.macroGoalText}>/ {goal}g</Text>
        </Text>
      </View>
      <View style={[styles.macroTrack, { backgroundColor: background }]}>
        <View style={[styles.macroFill, { width: `${Math.max(ratio * 100, 8)}%`, backgroundColor: fill }]} />
      </View>
    </View>
  );
}

function MealRow({ meal }: { meal: Meal }) {
  return (
    <View style={styles.listRow}>
      <View style={styles.rowBadge}>
        <Text style={styles.rowBadgeText}>{meal.label.slice(0, 1)}</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHead}>
          <Text style={styles.rowTitle}>{meal.label}</Text>
          <Text style={styles.rowMeta}>{meal.time}</Text>
        </View>
        <Text style={styles.rowCopy}>{meal.note}</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowKcal}>{meal.calories}</Text>
        <Text style={styles.rowProtein}>{meal.protein}g protein</Text>
      </View>
    </View>
  );
}

function BurnRow({ burn }: { burn: BurnEntry }) {
  const tone = burn.type === 'gym' ? theme.accentSoft : burn.type === 'run' ? theme.blueSoft : theme.greenSoft;
  const accent = burn.type === 'gym' ? theme.accent : burn.type === 'run' ? theme.blue : theme.green;

  return (
    <View style={styles.listRow}>
      <View style={[styles.rowBadge, { backgroundColor: tone }]}>
        <Text style={[styles.rowBadgeText, { color: accent }]}>•</Text>
      </View>
      <View style={styles.rowBody}>
        <View style={styles.rowHead}>
          <Text style={styles.rowTitle}>{burn.label}</Text>
          <Text style={styles.rowMeta}>{burn.minutes} min</Text>
        </View>
        <Text style={styles.rowCopy}>Manual burn applied for today's calorie balance.</Text>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowKcal}>{burn.calories} kcal</Text>
      </View>
    </View>
  );
}

function TrendBar({ point }: { point: TrendPoint }) {
  const baseline = 3000;
  const intakeHeight = Math.max((point.intake / baseline) * 110, 30);
  const targetHeight = Math.max((point.target / baseline) * 110, 30);

  return (
    <View style={styles.trendBar}>
      <View style={styles.trendBars}>
        <View style={[styles.targetBar, { height: targetHeight }]} />
        <View style={[styles.intakeBar, { height: intakeHeight }]} />
      </View>
      <Text style={styles.trendDay}>{point.day}</Text>
    </View>
  );
}

function LegendDot({ tint, label }: { tint: 'amber' | 'blue'; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: tint === 'amber' ? theme.accent : theme.blue }]} />
      <Text style={styles.legendLabel}>{label}</Text>
    </View>
  );
}

function CheatChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <View style={[styles.cheatChip, active && styles.cheatChipActive]}>
      <Text style={[styles.cheatChipText, active && styles.cheatChipTextActive]}>{label}</Text>
    </View>
  );
}

function CalorieStatePanel({ state }: { state: Exclude<CalorieScreenState, 'ready'> }) {
  const copy = {
    loading: {
      title: 'Calculating your plan',
      body: 'Sentri is preparing your calorie target, meals, and trend summaries.',
    },
    error: {
      title: 'Could not load calories',
      body: 'Try again after reconnecting or updating your body profile.',
    },
    empty: {
      title: 'Start your health profile',
      body: 'Add your body basics and goal so Sentri can calculate your daily calorie plan.',
    },
    success: {
      title: 'Plan updated',
      body: 'Your new calorie target and cheat-day plan are ready for today.',
    },
  } as const;

  const content = copy[state];

  return (
    <View style={styles.statePanel}>
      <Text style={styles.eyebrow}>Apple Health inspired</Text>
      <Text style={styles.title}>{content.title}</Text>
      <Text style={styles.subtitle}>{content.body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  statePanel: {
    flex: 1,
    paddingHorizontal: 18,
    paddingTop: 32,
    backgroundColor: theme.bg,
    gap: 10,
  },
  container: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 44,
    backgroundColor: theme.bg,
    position: 'relative',
  },
  backdropA: {
    position: 'absolute',
    top: -56,
    right: -96,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: 'rgba(241, 100, 54, 0.08)',
  },
  backdropB: {
    position: 'absolute',
    top: 180,
    left: -120,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: 'rgba(80, 120, 255, 0.08)',
  },
  hero: {
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  eyebrow: {
    color: theme.accent,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 8,
    color: theme.text,
    fontSize: 36,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  subtitle: {
    marginTop: 8,
    color: theme.subtext,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 220,
  },
  summaryRing: {
    width: 122,
    height: 122,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  ringCaption: {
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '700',
  },
  ringValue: {
    marginTop: 6,
    color: theme.text,
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  ringUnit: {
    marginTop: 2,
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  card: {
    marginTop: 14,
    borderRadius: 28,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 18,
    shadowColor: theme.shadow,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  profileCard: {
    backgroundColor: theme.mutedCard,
  },
  sectionHeader: {
    marginBottom: 14,
  },
  sectionCaption: {
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    marginTop: 4,
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  profileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  profileField: {
    width: '31%',
    minWidth: 88,
    borderRadius: 18,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  fieldLabel: {
    color: theme.subtext,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  fieldValue: {
    marginTop: 8,
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  goalRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  goalChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.line,
  },
  goalChipActive: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  goalChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  goalChipTextActive: {
    color: '#FFF6EF',
  },
  goalDetail: {
    marginTop: 14,
    borderRadius: 20,
    backgroundColor: theme.card,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.line,
  },
  goalDetailTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
  },
  goalDetailBody: {
    marginTop: 6,
    color: theme.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  statTile: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  statLabel: {
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '700',
  },
  statValue: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statUnit: {
    marginTop: 2,
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  progressTrack: {
    marginTop: 14,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.mutedCard,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: theme.accent,
  },
  progressCopy: {
    marginTop: 10,
    color: theme.subtext,
    fontSize: 13,
    lineHeight: 19,
  },
  progressHighlight: {
    color: theme.text,
    fontWeight: '800',
  },
  macroStack: {
    gap: 14,
  },
  macroRow: {
    gap: 8,
  },
  macroHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  macroLabel: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '700',
  },
  macroValueText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
  macroGoalText: {
    color: theme.subtext,
    fontWeight: '700',
  },
  macroTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 999,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  actionPill: {
    borderRadius: 999,
    backgroundColor: theme.mutedCard,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  actionPillText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  mealList: {
    gap: 10,
  },
  burnList: {
    gap: 10,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.line,
    backgroundColor: theme.card,
    padding: 14,
  },
  rowBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: theme.mutedCard,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBadgeText: {
    color: theme.accent,
    fontSize: 16,
    fontWeight: '800',
  },
  rowBody: {
    flex: 1,
    gap: 5,
  },
  rowHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  rowTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
  rowMeta: {
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  rowCopy: {
    color: theme.subtext,
    fontSize: 13,
    lineHeight: 18,
  },
  rowRight: {
    alignItems: 'flex-end',
  },
  rowKcal: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '800',
  },
  rowProtein: {
    marginTop: 4,
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  trendWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 8,
    height: 156,
    marginTop: 4,
  },
  trendBar: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  trendBars: {
    width: '100%',
    height: 112,
    justifyContent: 'flex-end',
    alignItems: 'center',
    position: 'relative',
  },
  targetBar: {
    width: 18,
    borderRadius: 9,
    backgroundColor: theme.blueSoft,
    position: 'absolute',
    bottom: 0,
  },
  intakeBar: {
    width: 18,
    borderRadius: 9,
    backgroundColor: theme.accent,
    position: 'absolute',
    bottom: 0,
    right: 0,
  },
  trendDay: {
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '700',
  },
  trendLegend: {
    marginTop: 6,
    flexDirection: 'row',
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
  },
  legendLabel: {
    color: theme.subtext,
    fontSize: 12,
    fontWeight: '600',
  },
  inlineStrong: {
    color: theme.text,
    fontWeight: '800',
  },
  cheatRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  cheatChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: theme.mutedCard,
    borderWidth: 1,
    borderColor: theme.line,
  },
  cheatChipActive: {
    backgroundColor: theme.accentSoft,
    borderColor: theme.accent,
  },
  cheatChipText: {
    color: theme.text,
    fontSize: 13,
    fontWeight: '700',
  },
  cheatChipTextActive: {
    color: theme.accent,
  },
  cardBody: {
    color: theme.subtext,
    fontSize: 14,
    lineHeight: 20,
  },
});
