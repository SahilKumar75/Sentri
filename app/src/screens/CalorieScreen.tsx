import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';

type CalorieScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

const profile = {
  age: 21,
  height: '176 cm',
  weight: '72 kg',
  bodyType: 'Lean',
  goal: 'Bulk',
  goalWeight: '78 kg',
  journey: '3 months',
  dailyTarget: 2680,
  consumed: 1890,
  burned: 420,
  cheatDay: 'Friday',
};

const macros = [
  { label: 'Protein', value: '124g', tint: theme.colors.fitnessGreen },
  { label: 'Carbs', value: '212g', tint: theme.colors.fitnessBlue },
  { label: 'Fats', value: '61g', tint: theme.colors.fitnessPink },
];

const meals = [
  { label: 'Breakfast', kcal: 480, note: 'Poha, eggs, milk', time: '08:40' },
  { label: 'Lunch', kcal: 665, note: 'Rice, dal, paneer bhurji', time: '13:15' },
  { label: 'Snack', kcal: 245, note: 'Banana and whey shake', time: '17:30' },
  { label: 'Dinner', kcal: 500, note: 'Chapati and chicken curry', time: '20:45' },
];

const workoutEntries = [
  { label: 'Functional strength', kcal: 220, meta: '58 min gym' },
  { label: 'Evening walk', kcal: 96, meta: '34 min walk' },
  { label: 'Cycling', kcal: 104, meta: '22 min ride' },
];

export default function CalorieScreen({ onOpenDrawer, avatarLabel }: CalorieScreenProps) {
  const [mealsToday, setMealsToday] = useState(meals);
  const [workoutsToday, setWorkoutsToday] = useState(workoutEntries);
  const [statusMessage, setStatusMessage] = useState('Goal auto-set from your onboarding details.');

  const consumed = mealsToday.reduce((total, meal) => total + meal.kcal, 0);
  const burned = workoutsToday.reduce((total, workout) => total + workout.kcal, 0);
  const remaining = profile.dailyTarget - consumed + burned;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <AvatarButton onPress={onOpenDrawer} tone="dark" label={avatarLabel} />
        <View style={styles.topCopy}>
          <Text style={styles.date}>Today, 23 Mar 2026</Text>
          <Text style={styles.title}>Summary</Text>
        </View>
      </View>

      <View style={styles.heroCard}>
        <View style={styles.ringWrap}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringValue}>{remaining}</Text>
              <Text style={styles.ringUnit}>kcal left</Text>
            </View>
          </View>
        </View>

        <View style={styles.heroCopy}>
          <Text style={styles.heroLabel}>Daily target</Text>
          <Text style={styles.heroTotal}>{profile.dailyTarget} kcal</Text>
          <Text style={styles.heroBody}>
            Calories burned from manual workouts are already added back into today’s remaining total.
          </Text>
        </View>
      </View>

      <View style={styles.statusCard}>
        <Text style={styles.statusText}>{statusMessage}</Text>
      </View>

      <View style={styles.metricRow}>
        <MetricCard label="Consumed" value={`${consumed}`} suffix="kcal" tint={theme.colors.fitnessPink} />
        <MetricCard label="Burned" value={`${burned}`} suffix="kcal" tint={theme.colors.fitnessGreen} />
      </View>

      <View style={styles.metricRow}>
        <MetricCard label="Goal" value={profile.goalWeight} suffix={profile.goal} tint={theme.colors.fitnessBlue} />
        <MetricCard label="Cheat day" value={profile.cheatDay} suffix="set" tint={theme.colors.textSoft} />
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Goal setup</Text>
        <View style={styles.setupGrid}>
          <SetupCell label="Age" value={`${profile.age}`} />
          <SetupCell label="Height" value={profile.height} />
          <SetupCell label="Weight" value={profile.weight} />
          <SetupCell label="Body type" value={profile.bodyType} />
          <SetupCell label="Goal" value={profile.goal} />
          <SetupCell label="Journey" value={profile.journey} />
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Macros</Text>
        <View style={styles.macroRow}>
          {macros.map((macro) => (
            <View key={macro.label} style={styles.macroCard}>
              <View style={[styles.macroDot, { backgroundColor: macro.tint }]} />
              <Text style={styles.macroLabel}>{macro.label}</Text>
              <Text style={[styles.macroValue, { color: macro.tint }]}>{macro.value}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meals</Text>
          <Pressable
            style={styles.inlineButton}
            onPress={() => {
              setMealsToday((current) => [
                ...current,
                { label: 'Quick add', kcal: 210, note: 'Hostel snack estimate', time: '21:30' },
              ]);
              setStatusMessage('Quick meal added to today.');
            }}
          >
            <Text style={styles.inlineButtonText}>Add meal</Text>
          </Pressable>
        </View>
        {mealsToday.map((meal) => (
          <View key={meal.label} style={styles.listRow}>
            <View>
              <Text style={styles.listTitle}>{meal.label}</Text>
              <Text style={styles.listMeta}>
                {meal.time} • {meal.note}
              </Text>
            </View>
            <Text style={styles.listValue}>{meal.kcal}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Workout burn</Text>
          <Pressable
            style={styles.inlineButton}
            onPress={() => {
              setWorkoutsToday((current) => [
                ...current,
                { label: 'Manual walk', kcal: 95, meta: '25 min quick add' },
              ]);
              setStatusMessage('Manual calorie burn added.');
            }}
          >
            <Text style={styles.inlineButtonText}>Log burn</Text>
          </Pressable>
        </View>
        {workoutsToday.map((entry) => (
          <View key={entry.label} style={styles.listRow}>
            <View>
              <Text style={styles.listTitle}>{entry.label}</Text>
              <Text style={styles.listMeta}>{entry.meta}</Text>
            </View>
            <Text style={[styles.listValue, styles.listValueGreen]}>{entry.kcal}</Text>
          </View>
        ))}
      </View>

      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Cheat day rhythm</Text>
        <Text style={styles.cheatBody}>
          One flexible day is scheduled for <Text style={styles.cheatBodyStrong}>{profile.cheatDay}</Text>, so the plan stays realistic for hostel meals, hangouts, and weekends.
        </Text>
        <View style={styles.cheatChips}>
          <CheatChip label="Friday" active />
          <CheatChip label="Saturday" />
          <CheatChip label="Sunday" />
          <CheatChip label="2 days / week" />
        </View>
      </View>
    </ScrollView>
  );
}

function MetricCard({
  label,
  value,
  suffix,
  tint,
}: {
  label: string;
  value: string;
  suffix: string;
  tint: string;
}) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={[styles.metricValue, { color: tint }]}>{value}</Text>
      <Text style={styles.metricSuffix}>{suffix}</Text>
    </View>
  );
}

function SetupCell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.setupCell}>
      <Text style={styles.setupLabel}>{label}</Text>
      <Text style={styles.setupValue}>{value}</Text>
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

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.darkBackground,
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
    gap: 2,
  },
  date: {
    color: theme.colors.darkTextSoft,
    fontSize: 14,
  },
  title: {
    color: theme.colors.darkText,
    fontSize: 28,
    fontWeight: '800',
  },
  heroCard: {
    marginTop: 20,
    backgroundColor: theme.colors.darkSurface,
    borderRadius: 28,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
  },
  ringWrap: {
    alignItems: 'center',
    marginBottom: 18,
  },
  ringOuter: {
    width: 178,
    height: 178,
    borderRadius: 89,
    borderWidth: 18,
    borderColor: theme.colors.fitnessPink,
    backgroundColor: theme.colors.fitnessPinkSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 116,
    height: 116,
    borderRadius: 58,
    backgroundColor: theme.colors.darkBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringValue: {
    color: theme.colors.darkText,
    fontSize: 30,
    fontWeight: '800',
  },
  ringUnit: {
    marginTop: 4,
    color: theme.colors.darkTextSoft,
    fontSize: 13,
  },
  heroCopy: {
    gap: 6,
  },
  statusCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.darkSurfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusText: {
    color: theme.colors.darkText,
    fontSize: 13,
    fontWeight: '700',
  },
  heroLabel: {
    color: theme.colors.darkTextSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTotal: {
    color: theme.colors.darkText,
    fontSize: 24,
    fontWeight: '800',
  },
  heroBody: {
    color: theme.colors.darkTextSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  metricRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.darkSurface,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
    padding: 16,
  },
  metricLabel: {
    color: theme.colors.darkTextSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: '800',
  },
  metricSuffix: {
    marginTop: 4,
    color: theme.colors.darkTextSoft,
    fontSize: 13,
  },
  card: {
    marginTop: 14,
    backgroundColor: theme.colors.darkSurface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.colors.darkLine,
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.darkText,
    fontSize: 21,
    fontWeight: '800',
  },
  inlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    backgroundColor: theme.colors.darkSurfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inlineButtonText: {
    color: theme.colors.darkText,
    fontSize: 13,
    fontWeight: '700',
  },
  setupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  setupCell: {
    width: '48%',
    minHeight: 82,
    backgroundColor: theme.colors.darkSurfaceAlt,
    borderRadius: 18,
    padding: 12,
    justifyContent: 'space-between',
  },
  setupLabel: {
    color: theme.colors.darkTextSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  setupValue: {
    color: theme.colors.darkText,
    fontSize: 18,
    fontWeight: '800',
  },
  macroRow: {
    flexDirection: 'row',
    gap: 10,
  },
  macroCard: {
    flex: 1,
    backgroundColor: theme.colors.darkSurfaceAlt,
    borderRadius: 18,
    padding: 14,
  },
  macroDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 12,
  },
  macroLabel: {
    color: theme.colors.darkTextSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  macroValue: {
    marginTop: 6,
    fontSize: 22,
    fontWeight: '800',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.darkLine,
  },
  listTitle: {
    color: theme.colors.darkText,
    fontSize: 16,
    fontWeight: '700',
  },
  listMeta: {
    marginTop: 4,
    color: theme.colors.darkTextSoft,
    fontSize: 13,
    maxWidth: 220,
  },
  listValue: {
    color: theme.colors.fitnessPink,
    fontSize: 20,
    fontWeight: '800',
  },
  listValueGreen: {
    color: theme.colors.fitnessGreen,
  },
  cheatBody: {
    marginTop: 10,
    color: theme.colors.darkTextSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  cheatBodyStrong: {
    color: theme.colors.darkText,
    fontWeight: '700',
  },
  cheatChips: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  cheatChip: {
    borderRadius: 999,
    backgroundColor: theme.colors.darkSurfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  cheatChipActive: {
    backgroundColor: theme.colors.fitnessPink,
  },
  cheatChipText: {
    color: theme.colors.darkTextSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  cheatChipTextActive: {
    color: '#FFF8FA',
  },
});
