import { useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';

type CalorieScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

type GoalMode = 'Lose' | 'Maintain' | 'Bulk';
type BodyType = 'Lean' | 'Average' | 'Heavy';
type CheatFrequency = '1 day / week' | '2 days / week';

type CalorieSetup = {
  age: string;
  height: string;
  weight: string;
  waist: string;
  thigh: string;
  neck: string;
  bodyType: BodyType;
  goal: GoalMode;
  idealBodyType: string;
  goalWeight: string;
  journeyMonths: string;
  cheatFrequency: CheatFrequency;
  cheatDay: string;
};

const defaultSetup: CalorieSetup = {
  age: '21',
  height: '176',
  weight: '72',
  waist: '',
  thigh: '',
  neck: '',
  bodyType: 'Lean',
  goal: 'Bulk',
  idealBodyType: 'Athletic',
  goalWeight: '78',
  journeyMonths: '3',
  cheatFrequency: '1 day / week',
  cheatDay: 'Friday',
};

const baseMeals = [
  { label: 'Breakfast', kcal: 480, note: 'Poha, eggs, milk', time: '08:40' },
  { label: 'Lunch', kcal: 665, note: 'Rice, dal, paneer bhurji', time: '13:15' },
  { label: 'Snack', kcal: 245, note: 'Banana and whey shake', time: '17:30' },
];

const baseBurns = [
  { label: 'Gym session', kcal: 220, meta: '58 min lifting' },
  { label: 'Walk', kcal: 96, meta: '34 min walk' },
];

export default function CalorieScreen({ onOpenDrawer, avatarLabel }: CalorieScreenProps) {
  const [setup, setSetup] = useState<CalorieSetup>(defaultSetup);
  const [setupComplete, setSetupComplete] = useState(false);
  const [meals, setMeals] = useState(baseMeals);
  const [burns, setBurns] = useState(baseBurns);
  const [statusMessage, setStatusMessage] = useState('Complete your setup to generate a calorie target.');

  const dailyTarget = useMemo(() => estimateDailyTarget(setup), [setup]);
  const consumed = meals.reduce((sum, meal) => sum + meal.kcal, 0);
  const burned = burns.reduce((sum, entry) => sum + entry.kcal, 0);
  const remaining = dailyTarget - consumed + burned;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
        <View style={styles.topCopy}>
          <Text style={styles.eyebrow}>Calorie</Text>
          <Text style={styles.title}>{setupComplete ? 'Your plan' : 'Build your plan'}</Text>
        </View>
      </View>

      {!setupComplete ? (
        <>
          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>Tell Sentri about your current body and goal.</Text>
            <Text style={styles.heroBody}>
              We’ll use your details, journey time, and cheat-day rhythm to set a realistic daily target for hostel life and gym days.
            </Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Basics</Text>
            <View style={styles.row}>
              <InputField
                label="Age"
                value={setup.age}
                onChangeText={(value) => updateSetup(setSetup, 'age', value)}
                keyboardType="number-pad"
                suffix="years"
              />
              <InputField
                label="Height"
                value={setup.height}
                onChangeText={(value) => updateSetup(setSetup, 'height', value)}
                keyboardType="number-pad"
                suffix="cm"
              />
            </View>
            <View style={styles.row}>
              <InputField
                label="Weight"
                value={setup.weight}
                onChangeText={(value) => updateSetup(setSetup, 'weight', value)}
                keyboardType="number-pad"
                suffix="kg"
              />
              <InputField
                label="Goal weight"
                value={setup.goalWeight}
                onChangeText={(value) => updateSetup(setSetup, 'goalWeight', value)}
                keyboardType="number-pad"
                suffix="kg"
              />
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Optional measurements</Text>
            <View style={styles.row}>
              <InputField
                label="Waist"
                value={setup.waist}
                onChangeText={(value) => updateSetup(setSetup, 'waist', value)}
                keyboardType="number-pad"
                suffix="cm"
              />
              <InputField
                label="Thigh"
                value={setup.thigh}
                onChangeText={(value) => updateSetup(setSetup, 'thigh', value)}
                keyboardType="number-pad"
                suffix="cm"
              />
            </View>
            <InputField
              label="Neck"
              value={setup.neck}
              onChangeText={(value) => updateSetup(setSetup, 'neck', value)}
              keyboardType="number-pad"
              suffix="cm"
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Body and goal</Text>
            <Text style={styles.fieldLabel}>Current body type</Text>
            <View style={styles.choiceRow}>
              {(['Lean', 'Average', 'Heavy'] as BodyType[]).map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={setup.bodyType === option}
                  onPress={() => updateSetup(setSetup, 'bodyType', option)}
                />
              ))}
            </View>

            <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Goal</Text>
            <View style={styles.choiceRow}>
              {(['Lose', 'Maintain', 'Bulk'] as GoalMode[]).map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={setup.goal === option}
                  onPress={() => updateSetup(setSetup, 'goal', option)}
                />
              ))}
            </View>

            <InputField
              label="Ideal body type"
              value={setup.idealBodyType}
              onChangeText={(value) => updateSetup(setSetup, 'idealBodyType', value)}
              placeholder="Athletic, lean bulk, toned..."
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Timeline and cheat days</Text>
            <InputField
              label="Journey time"
              value={setup.journeyMonths}
              onChangeText={(value) => updateSetup(setSetup, 'journeyMonths', value)}
              keyboardType="number-pad"
              suffix="months"
            />
            <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Cheat day frequency</Text>
            <View style={styles.choiceRow}>
              {(['1 day / week', '2 days / week'] as CheatFrequency[]).map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={setup.cheatFrequency === option}
                  onPress={() => updateSetup(setSetup, 'cheatFrequency', option)}
                />
              ))}
            </View>

            <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Preferred day</Text>
            <View style={styles.choiceRow}>
              {['Friday', 'Saturday', 'Sunday'].map((option) => (
                <ChoiceChip
                  key={option}
                  label={option}
                  active={setup.cheatDay === option}
                  onPress={() => updateSetup(setSetup, 'cheatDay', option)}
                />
              ))}
            </View>
          </View>

          <View style={styles.planPreview}>
            <Text style={styles.planLabel}>Estimated daily intake</Text>
            <Text style={styles.planValue}>{dailyTarget} kcal</Text>
            <Text style={styles.planBody}>
              Based on {setup.goal.toLowerCase()} mode, {setup.journeyMonths || '3'} months, and a {setup.cheatFrequency.toLowerCase()} rhythm.
            </Text>
          </View>

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              setSetupComplete(true);
              setStatusMessage(`Daily target set to ${dailyTarget} kcal for your ${setup.goal.toLowerCase()} plan.`);
            }}
          >
            <Text style={styles.primaryButtonText}>Build my plan</Text>
          </Pressable>
        </>
      ) : (
        <>
          <View style={styles.summaryHero}>
            <View>
              <Text style={styles.heroLabel}>Remaining today</Text>
              <Text style={styles.summaryValue}>{remaining}</Text>
              <Text style={styles.summaryUnit}>kcal</Text>
            </View>
            <View style={styles.ring}>
              <View style={styles.ringInner}>
                <Text style={styles.ringText}>{Math.max(Math.round((consumed / Math.max(dailyTarget, 1)) * 100), 0)}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.statusCard}>
            <Text style={styles.statusText}>{statusMessage}</Text>
          </View>

          <View style={styles.metricRow}>
            <MetricCard label="Target" value={`${dailyTarget}`} suffix="kcal" />
            <MetricCard label="Consumed" value={`${consumed}`} suffix="kcal" />
            <MetricCard label="Burned" value={`${burned}`} suffix="kcal" />
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Your setup</Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setSetupComplete(false);
                  setStatusMessage('Update your body details to rebuild the plan.');
                }}
              >
                <Text style={styles.secondaryButtonText}>Edit</Text>
              </Pressable>
            </View>
            <View style={styles.setupGrid}>
              <SetupPill label="Age" value={`${setup.age} y`} />
              <SetupPill label="Height" value={`${setup.height} cm`} />
              <SetupPill label="Weight" value={`${setup.weight} kg`} />
              <SetupPill label="Goal" value={setup.goal} />
              <SetupPill label="Goal weight" value={`${setup.goalWeight} kg`} />
              <SetupPill label="Cheat day" value={setup.cheatDay} />
            </View>
          </View>

          <View style={styles.card}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Meals</Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setMeals((current) => [
                    ...current,
                    { label: 'Quick add', kcal: 210, note: 'Hostel snack estimate', time: '21:30' },
                  ]);
                  setStatusMessage('Quick meal added.');
                }}
              >
                <Text style={styles.secondaryButtonText}>Add meal</Text>
              </Pressable>
            </View>
            {meals.map((meal) => (
              <View key={`${meal.label}-${meal.time}`} style={styles.listRow}>
                <View style={styles.listCopy}>
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
              <Text style={styles.sectionTitle}>Calories burned</Text>
              <Pressable
                style={styles.secondaryButton}
                onPress={() => {
                  setBurns((current) => [
                    ...current,
                    { label: 'Manual run', kcal: 110, meta: '20 min quick add' },
                  ]);
                  setStatusMessage('Manual burn added.');
                }}
              >
                <Text style={styles.secondaryButtonText}>Log burn</Text>
              </Pressable>
            </View>
            {burns.map((entry) => (
              <View key={`${entry.label}-${entry.meta}`} style={styles.listRow}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitle}>{entry.label}</Text>
                  <Text style={styles.listMeta}>{entry.meta}</Text>
                </View>
                <Text style={styles.listValue}>{entry.kcal}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Cheat day rhythm</Text>
            <Text style={styles.cheatText}>
              {setup.cheatFrequency} is active, with {setup.cheatDay} set as the primary relaxed day so the plan stays realistic.
            </Text>
          </View>
        </>
      )}
    </ScrollView>
  );
}

function updateSetup(
  setSetup: Dispatch<SetStateAction<CalorieSetup>>,
  key: keyof CalorieSetup,
  value: string
) {
  setSetup((current) => ({ ...current, [key]: value }));
}

function InputField({
  label,
  value,
  onChangeText,
  keyboardType,
  placeholder,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: 'default' | 'number-pad';
  placeholder?: string;
  suffix?: string;
}) {
  return (
    <View style={styles.inputField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textMuted}
          style={styles.input}
        />
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
    </View>
  );
}

function ChoiceChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.choiceChip, active && styles.choiceChipActive]} onPress={onPress}>
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function MetricCard({ label, value, suffix }: { label: string; value: string; suffix: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSuffix}>{suffix}</Text>
    </View>
  );
}

function SetupPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.setupPill}>
      <Text style={styles.setupPillLabel}>{label}</Text>
      <Text style={styles.setupPillValue}>{value}</Text>
    </View>
  );
}

function estimateDailyTarget(setup: CalorieSetup) {
  const weight = Number(setup.weight) || 70;
  const height = Number(setup.height) || 170;
  const age = Number(setup.age) || 21;
  const months = Math.max(Number(setup.journeyMonths) || 3, 1);
  const goalWeight = Number(setup.goalWeight) || weight;

  const base = Math.round(10 * weight + 6.25 * height - 5 * age + 500);
  const delta = goalWeight - weight;
  const pace = Math.round((delta * 7700) / (months * 30));

  if (setup.goal === 'Lose') return Math.max(base - Math.abs(pace), 1400);
  if (setup.goal === 'Bulk') return base + Math.max(pace, 220);
  return base;
}

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
    gap: 2,
  },
  eyebrow: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  heroCard: {
    marginTop: 18,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    ...theme.shadow.soft,
  },
  heroTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  heroBody: {
    marginTop: 10,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  card: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    ...theme.shadow.soft,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  inputField: {
    flex: 1,
    marginTop: 12,
  },
  fieldLabel: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldSpacing: {
    marginTop: 16,
  },
  inputShell: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
  },
  input: {
    flex: 1,
    minHeight: 50,
    color: theme.colors.text,
    fontSize: 15,
  },
  inputSuffix: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  choiceRow: {
    marginTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  choiceChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choiceChipActive: {
    backgroundColor: theme.colors.accent,
  },
  choiceChipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
  },
  planPreview: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: theme.colors.accent,
    padding: 18,
  },
  planLabel: {
    color: '#D2E3FC',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  planValue: {
    marginTop: 8,
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: '800',
  },
  planBody: {
    marginTop: 8,
    color: '#D2E3FC',
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    marginTop: 16,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceStrong,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  summaryHero: {
    marginTop: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    ...theme.shadow.soft,
  },
  heroLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  summaryValue: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 40,
    fontWeight: '800',
  },
  summaryUnit: {
    color: theme.colors.textSoft,
    fontSize: 15,
    fontWeight: '700',
  },
  ring: {
    width: 116,
    height: 116,
    borderRadius: 58,
    borderWidth: 12,
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringText: {
    color: theme.colors.accentStrong,
    fontSize: 18,
    fontWeight: '800',
  },
  statusCard: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.accentSoft,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusText: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  metricRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
  },
  metricLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  metricValue: {
    marginTop: 8,
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
  },
  metricSuffix: {
    marginTop: 4,
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  secondaryButton: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  setupGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  setupPill: {
    width: '47%',
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 12,
    gap: 4,
  },
  setupPillLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  setupPillValue: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: theme.colors.line,
  },
  listCopy: {
    flex: 1,
    paddingRight: 12,
  },
  listTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  listMeta: {
    marginTop: 4,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  listValue: {
    color: theme.colors.accentStrong,
    fontSize: 22,
    fontWeight: '800',
  },
  cheatText: {
    marginTop: 10,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
});
