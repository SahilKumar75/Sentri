import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AvatarButton } from '../components/sentri-ui';
import { SearchBar } from '../components/SearchBar';
import { Toast } from '../components/Toast';
import { theme } from '../design/tokens';
import { PERSISTENT_KEYS } from '../lib/persistent-keys';
import { usePersistedState } from '../lib/use-persisted-state';
const defaultSetup = {
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
    { label: 'Breakfast', kcal: 430, note: 'Poha, eggs, milk', time: '08:40' },
    { label: 'Lunch', kcal: 640, note: 'Rice, dal, paneer bhurji', time: '13:15' },
    { label: 'Snack', kcal: 240, note: 'Banana and whey shake', time: '17:30' },
];
const baseBurns = [
    { label: 'Gym session', kcal: 220, meta: '58 min lifting' },
    { label: 'Walk', kcal: 96, meta: '34 min walk' },
];
const mealPresets = [
    { label: 'Mess breakfast', kcal: 320, note: 'Poha + eggs estimate', time: '08:30' },
    { label: 'Hostel lunch', kcal: 620, note: 'Rice + dal + sabzi', time: '13:10' },
    { label: 'Evening snack', kcal: 180, note: 'Fruit and tea', time: '17:45' },
];
const burnPresets = [
    { label: 'Walk', kcal: 95, meta: '30 min campus walk' },
    { label: 'Gym', kcal: 210, meta: '45 min weight training' },
    { label: 'Run', kcal: 160, meta: '20 min easy run' },
];
const defaultPersistedCalorieState = {
    setup: defaultSetup,
    setupComplete: false,
    meals: baseMeals,
    burns: baseBurns,
    statusMessage: 'Finish your setup to unlock today tracking.',
};
export default function CalorieScreen({ onOpenDrawer, avatarLabel }) {
    const { value: persistedState, setValue: setPersistedState, hydrated } = usePersistedState(PERSISTENT_KEYS.calorieState, defaultPersistedCalorieState);
    const [setup, setSetup] = useState(defaultSetup);
    const [setupComplete, setSetupComplete] = useState(false);
    const [meals, setMeals] = useState(baseMeals);
    const [burns, setBurns] = useState(baseBurns);
    const [statusMessage, setStatusMessage] = useState('Finish your setup to unlock today tracking.');
    const [mealDraftLabel, setMealDraftLabel] = useState('');
    const [mealDraftCalories, setMealDraftCalories] = useState('');
    const [mealDraftError, setMealDraftError] = useState('');
    const [burnDraftLabel, setBurnDraftLabel] = useState('');
    const [burnDraftCalories, setBurnDraftCalories] = useState('');
    const [burnDraftError, setBurnDraftError] = useState('');
    const [toast, setToast] = useState({ visible: false, message: '', type: 'info' });
    const [mealSearchQuery, setMealSearchQuery] = useState('');
    const dailyTarget = useMemo(() => estimateDailyTarget(setup), [setup]);
    const macroTargets = useMemo(() => estimateMacros(setup, dailyTarget), [setup, dailyTarget]);
    const filteredMeals = useMemo(() => {
        if (!mealSearchQuery.trim()) return meals;
        const q = mealSearchQuery.toLowerCase();
        return meals.filter(m => m.label.toLowerCase().includes(q) || m.note.toLowerCase().includes(q));
    }, [meals, mealSearchQuery]);
    const consumed = meals.reduce((sum, meal) => sum + meal.kcal, 0);
    const burned = burns.reduce((sum, entry) => sum + entry.kcal, 0);
    const netCalories = consumed - burned;
    const remaining = dailyTarget - netCalories;
    const completion = Math.max(Math.min(Math.round((netCalories / Math.max(dailyTarget, 1)) * 100), 100), 0);
    const setupReadiness = useMemo(() => {
        const filled = [setup.age, setup.height, setup.weight, setup.goalWeight, setup.journeyMonths, setup.idealBodyType].filter((value) => value.trim().length > 0).length;
        return Math.round((filled / 6) * 100);
    }, [setup]);
    const requiredSetupFields = useMemo(() => [setup.age, setup.height, setup.weight, setup.goalWeight, setup.journeyMonths, setup.idealBodyType], [setup.age, setup.goalWeight, setup.height, setup.idealBodyType, setup.journeyMonths, setup.weight]);
    const canBuildPlan = requiredSetupFields.every((value) => value.trim().length > 0);
    const dayBalance = useMemo(() => {
        if (remaining > 180) {
            return {
                title: 'Room left in today plan',
                body: `You still have ${remaining} kcal to work with today. Add dinner or a shake if that fits the goal.`,
                tone: 'info',
            };
        }
        if (remaining >= -120) {
            return {
                title: 'Right around target',
                body: 'You are close to the calorie target today. Focus on protein quality and hydration now.',
                tone: 'success',
            };
        }
        return {
            title: 'Above today target',
            body: `You are ${Math.abs(remaining)} kcal above target right now. Logging a walk or trimming the next meal can rebalance it.`,
            tone: 'error',
        };
    }, [remaining]);
    useEffect(() => {
        if (!hydrated) {
            return;
        }
        setSetup(persistedState.setup);
        setSetupComplete(persistedState.setupComplete);
        setMeals(persistedState.meals);
        setBurns(persistedState.burns);
        setStatusMessage(persistedState.statusMessage);
    }, [hydrated, persistedState]);
    useEffect(() => {
        if (!hydrated) {
            return;
        }
        setPersistedState({
            setup,
            setupComplete,
            meals,
            burns,
            statusMessage,
        });
    }, [burns, hydrated, meals, setPersistedState, setup, setupComplete, statusMessage]);
    return (<ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.topRow}>
        <AvatarButton onPress={onOpenDrawer} label={avatarLabel} tone="dark"/>
        <View style={styles.topCopy}>
          <Text style={styles.eyebrow}>Apple Health inspired</Text>
          <Text style={styles.title}>{setupComplete ? 'Today' : 'Build your plan'}</Text>
          <Text style={styles.subtitle}>
            {setupComplete
            ? 'Track meals, gym burn, and cheat-day rhythm in one calm view.'
            : 'Tell Sentri your body details and goal so the plan actually fits student life.'}
          </Text>
        </View>
      </View>

      {!setupComplete ? (<>
          <View style={styles.progressCard}>
            <View>
              <Text style={styles.progressLabel}>Setup readiness</Text>
              <Text style={styles.progressValue}>{setupReadiness}%</Text>
            </View>
            <View style={styles.ring}>
              <View style={styles.ringInner}>
                <Text style={styles.ringText}>{setupReadiness}%</Text>
              </View>
            </View>
          </View>

          <View style={styles.heroCard}>
            <Text style={styles.heroTitle}>One setup. One daily target. Built for hostel meals and student gym sessions.</Text>
            <Text style={styles.heroBody}>
              We use age, height, weight, optional measurements, body type, goal weight, journey time, and cheat-day rhythm.
            </Text>
          </View>

          <Section title="Starting point">
            <View style={styles.row}>
              <InputField label="Age" value={setup.age} onChangeText={(value) => updateSetup(setSetup, 'age', value)} keyboardType="number-pad" suffix="years"/>
              <InputField label="Height" value={setup.height} onChangeText={(value) => updateSetup(setSetup, 'height', value)} keyboardType="number-pad" suffix="cm"/>
            </View>
            <View style={styles.row}>
              <InputField label="Weight" value={setup.weight} onChangeText={(value) => updateSetup(setSetup, 'weight', value)} keyboardType="number-pad" suffix="kg"/>
              <InputField label="Goal weight" value={setup.goalWeight} onChangeText={(value) => updateSetup(setSetup, 'goalWeight', value)} keyboardType="number-pad" suffix="kg"/>
            </View>
          </Section>

          <Section title="Optional measurements">
            <View style={styles.row}>
              <InputField label="Waist" value={setup.waist} onChangeText={(value) => updateSetup(setSetup, 'waist', value)} keyboardType="number-pad" suffix="cm"/>
              <InputField label="Thigh" value={setup.thigh} onChangeText={(value) => updateSetup(setSetup, 'thigh', value)} keyboardType="number-pad" suffix="cm"/>
            </View>
            <InputField label="Neck" value={setup.neck} onChangeText={(value) => updateSetup(setSetup, 'neck', value)} keyboardType="number-pad" suffix="cm"/>
          </Section>

          <Section title="Goal direction">
            <Text style={styles.fieldLabel}>Current body type</Text>
            <View style={styles.choiceRow}>
              {['Lean', 'Average', 'Heavy'].map((option) => (<ChoiceChip key={option} label={option} active={setup.bodyType === option} onPress={() => updateSetup(setSetup, 'bodyType', option)}/>))}
            </View>

            <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Goal</Text>
            <View style={styles.choiceRow}>
              {['Lose', 'Maintain', 'Bulk'].map((option) => (<ChoiceChip key={option} label={option} active={setup.goal === option} onPress={() => updateSetup(setSetup, 'goal', option)}/>))}
            </View>

            <InputField label="Ideal body type" value={setup.idealBodyType} onChangeText={(value) => updateSetup(setSetup, 'idealBodyType', value)} placeholder="Athletic, lean bulk, toned..."/>
          </Section>

          <Section title="Timeline and cheat days">
            <InputField label="Journey time" value={setup.journeyMonths} onChangeText={(value) => updateSetup(setSetup, 'journeyMonths', value)} keyboardType="number-pad" suffix="months"/>
            <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Cheat day frequency</Text>
            <View style={styles.choiceRow}>
              {['1 day / week', '2 days / week'].map((option) => (<ChoiceChip key={option} label={option} active={setup.cheatFrequency === option} onPress={() => updateSetup(setSetup, 'cheatFrequency', option)}/>))}
            </View>

            <Text style={[styles.fieldLabel, styles.fieldSpacing]}>Preferred day</Text>
            <View style={styles.choiceRow}>
              {['Friday', 'Saturday', 'Sunday'].map((option) => (<ChoiceChip key={option} label={option} active={setup.cheatDay === option} onPress={() => updateSetup(setSetup, 'cheatDay', option)}/>))}
            </View>
          </Section>

          <View style={styles.previewCard}>
            <Text style={styles.previewLabel}>Estimated daily intake</Text>
            <Text style={styles.previewValue}>{dailyTarget} kcal</Text>
            <Text style={styles.previewBody}>
              Built from {setup.goal.toLowerCase()} mode, {setup.journeyMonths || '3'} months, and a {setup.cheatFrequency.toLowerCase()} rhythm.
            </Text>
            <View style={styles.previewMacroRow}>
              <MacroChip label="Protein" value={`${macroTargets.protein}g`}/>
              <MacroChip label="Carbs" value={`${macroTargets.carbs}g`}/>
              <MacroChip label="Fats" value={`${macroTargets.fats}g`}/>
            </View>
          </View>

          <Pressable style={[styles.primaryButton, !canBuildPlan && styles.primaryButtonDisabled]} onPress={() => {
                if (!canBuildPlan) {
                    setToast({ visible: true, message: 'Fill age, height, weight, goal weight, timeline, and ideal body type first.', type: 'error' });
                    return;
                }
                setSetupComplete(true);
                setToast({ visible: true, message: `Plan ready. Target is ${dailyTarget} kcal.`, type: 'success' });
            }}>
            <Text style={styles.primaryButtonText}>Build my plan</Text>
          </Pressable>
          {!canBuildPlan ? (<Text style={styles.setupHelperText}>
              Complete the core fields first so Sentri can calculate a realistic daily target.
            </Text>) : null}
        </>) : (<>
          <View style={styles.summaryHero}>
            <View style={styles.summaryCopy}>
              <Text style={styles.heroLabel}>Remaining today</Text>
              <Text style={styles.summaryValue}>{remaining}</Text>
              <Text style={styles.summaryUnit}>kcal left after meals and burn</Text>
            </View>
            <View style={styles.ringLarge}>
              <View style={styles.ringLargeInner}>
                <Text style={styles.ringLargeText}>{completion}%</Text>
              </View>
            </View>
          </View>

          <View style={[
                styles.statusCard,
                dayBalance.tone === 'success' && styles.statusCardSuccess,
                dayBalance.tone === 'error' && styles.statusCardError,
            ]}>
            <Text style={styles.statusLabel}>{dayBalance.title}</Text>
            <Text style={styles.statusText}>{dayBalance.body}</Text>
            <Text style={styles.statusCaption}>{statusMessage}</Text>
          </View>

          <View style={styles.metricGrid}>
            <MetricCard label="Target" value={`${dailyTarget}`} suffix="kcal"/>
            <MetricCard label="Consumed" value={`${consumed}`} suffix="kcal"/>
            <MetricCard label="Burned" value={`${burned}`} suffix="kcal"/>
            <MetricCard label="Net" value={`${netCalories}`} suffix="kcal"/>
          </View>

          <View style={styles.cardDark}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleDark}>Macro targets</Text>
              <View style={styles.headerActions}>
                <Pressable style={styles.secondaryButton} onPress={() => {
                setMeals(baseMeals);
                  <Text style={styles.secondaryButtonText}>Reset day</Text>
                </Pressable>
                <Pressable style={styles.secondaryButton} onPress={() => {
                setSetupComplete(false);
            }}>
                  <Text style={styles.secondaryButtonText}>Edit plan</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.macroGrid}>
              <MacroCard label="Protein" value={`${macroTargets.protein} g`} note="Keep this high for recovery."/>
              <MacroCard label="Carbs" value={`${macroTargets.carbs} g`} note="Fuel for class + training."/>
              <MacroCard label="Fats" value={`${macroTargets.fats} g`} note="Hormones and satiety."/>
              <MacroCard label="Cheat budget" value={`${macroTargets.cheatAllowance} kcal`} note={`${setup.cheatFrequency} on ${setup.cheatDay}`}/>
            </View>
          </View>

          <View style={styles.cardDark}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleDark}>Quick log</Text>
              <Text style={styles.sectionMetaDark}>Fast add for hostel meals and workouts</Text>
            </View>

            <Text style={styles.fieldLabelDark}>Meal label</Text>
            <View style={styles.composerRow}>
              <View style={{ flex: 1 }}>
                <TextInput value={mealDraftLabel} onChangeText={(v) => { setMealDraftLabel(v); setMealDraftError(''); }} placeholder="Mess lunch, snack, dinner..." placeholderTextColor={theme.colors.darkTextSoft} style={[styles.composerInput, mealDraftError && { borderColor: '#B3261E' }]}/>
              </View>
              <TextInput value={mealDraftCalories} onChangeText={(v) => { setMealDraftCalories(v); setMealDraftError(''); }} placeholder="kcal" placeholderTextColor={theme.colors.darkTextSoft} keyboardType="number-pad" style={[styles.composerInput, styles.composerInputSmall, mealDraftError && { borderColor: '#B3261E' }]}/>
              <Pressable style={styles.composerButton} onPress={() => {
                setMealDraftError('');
                const kcal = Number(mealDraftCalories) || 0;
                const label = mealDraftLabel.trim() || 'Manual meal';
                if (!kcal) {
                    setMealDraftError('Req');
                    return;
                }
                setMeals((current) => [
                    ...current,
                    { label, kcal, note: 'Manual meal entry', time: 'Now' },
                ]);
                setMealDraftLabel('');
                setMealDraftCalories('');
                setToast({ visible: true, message: `Added ${label} (${kcal} kcal).`, type: 'success' });
            }}>
                <Text style={styles.composerButtonText}>Add meal</Text>
              </Pressable>
            </View>
            {mealDraftError ? <Text style={{ color: '#B3261E', fontSize: 12, marginTop: 4, marginLeft: 4 }}>Calorie value is required</Text> : null}

            <View style={styles.presetRow}>
              {mealPresets.map((preset) => (<Pressable key={preset.label} style={styles.presetChip} onPress={() => {
                    setMeals((current) => [...current, preset]);
                    setToast({ visible: true, message: `Added ${preset.label}.`, type: 'success' });
                }}>
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </Pressable>))}
            </View>

            {meals.length === 0 ? (
              <View style={styles.emptyStateCardDark}>
                <Ionicons name="restaurant-outline" size={32} color={theme.colors.darkTextSoft} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyStateTitleDark}>No meals logged yet</Text>
                <Text style={styles.emptyStateBodyDark}>
                  Use the quick log or tap a preset above to track your first meal.
                </Text>
              </View>
            ) : null}

            {meals.length > 0 && (
              <View style={{ marginTop: 16, marginBottom: 8 }}>
                <SearchBar value={mealSearchQuery} onChangeText={setMealSearchQuery} placeholder="Search meals..." onClear={() => setMealSearchQuery('')} />
              </View>
            )}

            {filteredMeals.map((meal, idx) => (<View key={`${meal.label}-${meal.time}-${idx}`} style={styles.listRowDark}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitleDark}>{meal.label}</Text>
                  <Text style={styles.listMetaDark}>
                    {meal.time} • {meal.note}
                  </Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.listValueDark}>{meal.kcal}</Text>
                  <Pressable style={styles.removeButton} onPress={() => {
                    setMeals((current) => current.filter((entry) => !(entry.label === meal.label && entry.time === meal.time)));
                    setToast({ visible: true, message: `Removed ${meal.label}.`, type: 'success' });
                }}>
                    <Ionicons name="trash-outline" size={15} color={theme.colors.darkTextSoft}/>
                  </Pressable>
                </View>
              </View>))}
          </View>

          <View style={styles.cardDark}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleDark}>Calories burned</Text>
              <Text style={styles.sectionMetaDark}>Manual burn minus from your day</Text>
            </View>

            <View style={styles.composerRow}>
              <View style={{ flex: 1 }}>
                <TextInput value={burnDraftLabel} onChangeText={(v) => { setBurnDraftLabel(v); setBurnDraftError(''); }} placeholder="Gym, walk, run..." placeholderTextColor={theme.colors.darkTextSoft} style={[styles.composerInput, burnDraftError && { borderColor: '#B3261E' }]}/>
              </View>
              <TextInput value={burnDraftCalories} onChangeText={(v) => { setBurnDraftCalories(v); setBurnDraftError(''); }} placeholder="kcal" placeholderTextColor={theme.colors.darkTextSoft} keyboardType="number-pad" style={[styles.composerInput, styles.composerInputSmall, burnDraftError && { borderColor: '#B3261E' }]}/>
              <Pressable style={styles.composerButton} onPress={() => {
                setBurnDraftError('');
                const kcal = Number(burnDraftCalories) || 0;
                const label = burnDraftLabel.trim() || 'Manual burn';
                if (!kcal) {
                    setBurnDraftError('Req');
                    return;
                }
                setBurns((current) => [
                    ...current,
                    { label, kcal, meta: 'Manual burn entry' },
                ]);
                setBurnDraftLabel('');
                setBurnDraftCalories('');
                setToast({ visible: true, message: `Logged ${label} (${kcal} kcal).`, type: 'success' });
            }}>
                <Text style={styles.composerButtonText}>Log burn</Text>
              </Pressable>
            </View>
            {burnDraftError ? <Text style={{ color: '#B3261E', fontSize: 12, marginTop: 4, marginLeft: 4 }}>Calorie value is required</Text> : null}

            <View style={styles.presetRow}>
              {burnPresets.map((preset) => (<Pressable key={preset.label} style={styles.presetChip} onPress={() => {
                    setBurns((current) => [...current, preset]);
                    setToast({ visible: true, message: `Added ${preset.label}.`, type: 'success' });
                }}>
                  <Text style={styles.presetChipText}>{preset.label}</Text>
                </Pressable>))}
            </View>

            {burns.length === 0 ? (
              <View style={styles.emptyStateCardDark}>
                <Ionicons name="flame-outline" size={32} color={theme.colors.darkTextSoft} style={{ marginBottom: 12 }} />
                <Text style={styles.emptyStateTitleDark}>No burns logged yet</Text>
                <Text style={styles.emptyStateBodyDark}>
                  Track your gym session or walk to subtract calories from today's net.
                </Text>
              </View>
            ) : null}

            {burns.map((entry, idx) => (<View key={`${entry.label}-${entry.meta}-${idx}`} style={styles.listRowDark}>
                <View style={styles.listCopy}>
                  <Text style={styles.listTitleDark}>{entry.label}</Text>
                  <Text style={styles.listMetaDark}>{entry.meta}</Text>
                </View>
                <View style={styles.listRight}>
                  <Text style={styles.listValueDark}>{entry.kcal}</Text>
                  <Pressable style={styles.removeButton} onPress={() => {
                    setBurns((current) => current.filter((item) => !(item.label === entry.label && item.meta === entry.meta)));
                    setToast({ visible: true, message: `Removed ${entry.label}.`, type: 'success' });
                }}>
                    <Ionicons name="trash-outline" size={15} color={theme.colors.darkTextSoft}/>
                  </Pressable>
                </View>
              </View>))}
          </View>

          <View style={styles.cardDark}>
            <Text style={styles.sectionTitleDark}>Cheat day rhythm</Text>
            <Text style={styles.cheatTextDark}>
              {setup.cheatFrequency} is active, with {setup.cheatDay} set as the relaxed day so the plan stays realistic.
            </Text>
          </View>

          <View style={styles.cardDark}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitleDark}>Plan snapshot</Text>
              <Pressable style={styles.secondaryButtonDark} onPress={() => {
                setSetupComplete(false);
            }}>
                <Text style={styles.secondaryButtonTextDark}>Update</Text>
              </Pressable>
            </View>
            <View style={styles.snapshotGrid}>
              <SnapshotPill label="Age" value={`${setup.age} y`}/>
              <SnapshotPill label="Height" value={`${setup.height} cm`}/>
              <SnapshotPill label="Weight" value={`${setup.weight} kg`}/>
              <SnapshotPill label="Goal" value={setup.goal}/>
              <SnapshotPill label="Goal weight" value={`${setup.goalWeight} kg`}/>
              <SnapshotPill label="Cheat day" value={setup.cheatDay}/>
            </View>
          </View>
        </>)}
      <Toast visible={toast.visible} message={toast.message} type={toast.type} onHide={() => setToast(prev => ({ ...prev, visible: false }))} />
    </ScrollView>);
}
function updateSetup(setSetup, key, value) {
    setSetup((current) => ({ ...current, [key]: value }));
}
function InputField({ label, value, onChangeText, keyboardType, placeholder, suffix, }) {
    return (<View style={styles.inputField}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <View style={styles.inputShell}>
        <TextInput value={value} onChangeText={onChangeText} keyboardType={keyboardType} placeholder={placeholder} placeholderTextColor={theme.colors.darkTextSoft} style={styles.input}/>
        {suffix ? <Text style={styles.inputSuffix}>{suffix}</Text> : null}
      </View>
    </View>);
}
function ChoiceChip({ label, active, onPress, }) {
    return (<Pressable style={[styles.choiceChip, active && styles.choiceChipActive]} onPress={onPress}>
      <Text style={[styles.choiceChipText, active && styles.choiceChipTextActive]}>{label}</Text>
    </Pressable>);
}
function MacroChip({ label, value }) {
    return (<View style={styles.macroChip}>
      <Text style={styles.macroChipLabel}>{label}</Text>
      <Text style={styles.macroChipValue}>{value}</Text>
    </View>);
}
function MetricCard({ label, value, suffix }) {
    return (<View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricSuffix}>{suffix}</Text>
    </View>);
}
function MacroCard({ label, value, note }) {
    return (<View style={styles.macroCard}>
      <Text style={styles.macroCardLabel}>{label}</Text>
      <Text style={styles.macroCardValue}>{value}</Text>
      <Text style={styles.macroCardNote}>{note}</Text>
    </View>);
}
function SnapshotPill({ label, value }) {
    return (<View style={styles.snapshotPill}>
      <Text style={styles.snapshotLabel}>{label}</Text>
      <Text style={styles.snapshotValue}>{value}</Text>
    </View>);
}
function Section({ title, children }) {
    return (<View style={styles.section}>
      <Text style={styles.sectionTitleLight}>{title}</Text>
      {children}
    </View>);
}
function estimateDailyTarget(setup) {
    const weight = Number(setup.weight) || 70;
    const height = Number(setup.height) || 170;
    const age = Number(setup.age) || 21;
    const months = Math.max(Number(setup.journeyMonths) || 3, 1);
    const goalWeight = Number(setup.goalWeight) || weight;
    const bmr = 10 * weight + 6.25 * height - 5 * age + 5;
    const maintenance = Math.round(bmr * 1.45);
    const paceAdjustment = Math.round(((goalWeight - weight) * 7700) / (months * 30));
    const cheatAdjustment = setup.cheatFrequency === '2 days / week' ? 90 : 60;
    if (setup.goal === 'Lose') {
        return Math.max(maintenance - 320 + Math.round(paceAdjustment / 5) - cheatAdjustment, 1400);
    }
    if (setup.goal === 'Bulk') {
        return maintenance + 260 + Math.max(Math.round(paceAdjustment / 5), 180) + cheatAdjustment;
    }
    return Math.max(maintenance + Math.round(paceAdjustment / 6), 1500);
}
function estimateMacros(setup, dailyTarget) {
    const weight = Number(setup.weight) || 70;
    const proteinMultiplier = setup.goal === 'Bulk' ? 2 : setup.goal === 'Lose' ? 1.8 : 1.65;
    const protein = Math.max(Math.round(weight * proteinMultiplier), 90);
    const fats = Math.max(Math.round(weight * 0.8), 45);
    const remainingCalories = Math.max(dailyTarget - protein * 4 - fats * 9, 0);
    const carbs = Math.max(Math.round(remainingCalories / 4), 80);
    const cheatAllowance = Math.round(dailyTarget * (setup.cheatFrequency === '2 days / week' ? 0.22 : 0.16));
    return { protein, carbs, fats, cheatAllowance };
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
        flex: 1,
        gap: 4,
    },
    eyebrow: {
        color: theme.colors.fitnessBlue,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    title: {
        color: theme.colors.darkText,
        fontSize: 30,
        fontWeight: '800',
    },
    subtitle: {
        color: theme.colors.darkTextSoft,
        fontSize: 14,
        lineHeight: 20,
    },
    progressCard: {
        marginTop: 18,
        borderRadius: 28,
        backgroundColor: theme.colors.darkSurface,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        padding: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressLabel: {
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    progressValue: {
        marginTop: 8,
        color: theme.colors.darkText,
        fontSize: 34,
        fontWeight: '800',
    },
    ring: {
        width: 104,
        height: 104,
        borderRadius: 52,
        borderWidth: 12,
        borderColor: theme.colors.accent,
        backgroundColor: '#0D2746',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringInner: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: theme.colors.darkBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringText: {
        color: theme.colors.darkText,
        fontSize: 15,
        fontWeight: '800',
    },
    heroCard: {
        marginTop: 16,
        borderRadius: 28,
        backgroundColor: theme.colors.darkSurface,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        padding: 18,
    },
    heroTitle: {
        color: theme.colors.darkText,
        fontSize: 22,
        fontWeight: '800',
        lineHeight: 30,
    },
    heroBody: {
        marginTop: 10,
        color: theme.colors.darkTextSoft,
        fontSize: 14,
        lineHeight: 21,
    },
    section: {
        marginTop: 18,
    },
    sectionTitleLight: {
        color: theme.colors.darkText,
        fontSize: 20,
        fontWeight: '800',
        marginBottom: 12,
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
        color: theme.colors.darkTextSoft,
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
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 14,
    },
    input: {
        flex: 1,
        minHeight: 50,
        color: theme.colors.darkText,
        fontSize: 15,
    },
    inputSuffix: {
        color: theme.colors.darkTextSoft,
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
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    choiceChipActive: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.accent,
    },
    choiceChipText: {
        color: theme.colors.darkText,
        fontSize: 13,
        fontWeight: '700',
    },
    choiceChipTextActive: {
        color: '#FFFFFF',
    },
    previewCard: {
        marginTop: 16,
        borderRadius: 26,
        backgroundColor: '#0F223D',
        borderWidth: 1,
        borderColor: 'rgba(138,180,248,0.24)',
        padding: 18,
    },
    previewLabel: {
        color: theme.colors.fitnessBlue,
        fontSize: 12,
        fontWeight: '800',
        letterSpacing: 0.8,
        textTransform: 'uppercase',
    },
    previewValue: {
        marginTop: 8,
        color: '#FFFFFF',
        fontSize: 36,
        fontWeight: '800',
    },
    previewBody: {
        marginTop: 8,
        color: theme.colors.darkTextSoft,
        fontSize: 14,
        lineHeight: 20,
    },
    previewMacroRow: {
        marginTop: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    macroChip: {
        borderRadius: 18,
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.08)',
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    macroChipLabel: {
        color: theme.colors.darkTextSoft,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.7,
    },
    macroChipValue: {
        marginTop: 4,
        color: theme.colors.darkText,
        fontSize: 15,
        fontWeight: '800',
    },
    primaryButton: {
        marginTop: 16,
        borderRadius: 22,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 16,
    },
    primaryButtonDisabled: {
        opacity: 0.45,
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
    setupHelperText: {
        marginTop: 10,
        color: theme.colors.darkTextSoft,
        fontSize: 13,
        lineHeight: 19,
    },
    summaryHero: {
        marginTop: 18,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        borderRadius: 30,
        backgroundColor: theme.colors.darkSurface,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        padding: 18,
    },
    summaryCopy: {
        flex: 1,
    },
    heroLabel: {
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    summaryValue: {
        marginTop: 8,
        color: theme.colors.darkText,
        fontSize: 42,
        fontWeight: '800',
    },
    summaryUnit: {
        marginTop: 4,
        color: theme.colors.darkTextSoft,
        fontSize: 14,
        fontWeight: '600',
    },
    ringLarge: {
        width: 118,
        height: 118,
        borderRadius: 59,
        borderWidth: 12,
        borderColor: theme.colors.fitnessPink,
        backgroundColor: '#281024',
        alignItems: 'center',
        justifyContent: 'center',
    },
    ringLargeInner: {
        width: 74,
        height: 74,
        borderRadius: 37,
        backgroundColor: theme.colors.darkBackground,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyStateCardDark: {
        alignItems: 'center',
        paddingVertical: 32,
        marginTop: 16,
        borderRadius: 24,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        borderStyle: 'dashed',
    },
    emptyStateTitleDark: {
        color: theme.colors.darkText,
        fontSize: 16,
        fontWeight: '700',
    },
    emptyStateBodyDark: {
        color: theme.colors.darkTextSoft,
        fontSize: 14,
        textAlign: 'center',
        marginTop: 6,
        maxWidth: 240,
        lineHeight: 20,
    },
    ringLargeText: {
        color: theme.colors.darkText,
        fontSize: 18,
        fontWeight: '800',
    },
    statusCard: {
        marginTop: 14,
        borderRadius: 18,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 14,
        paddingVertical: 12,
    },
    statusCardSuccess: {
        borderColor: '#244C37',
        backgroundColor: '#13251B',
    },
    statusCardError: {
        borderColor: '#5F2120',
        backgroundColor: '#261615',
    },
    statusLabel: {
        color: theme.colors.darkText,
        fontSize: 15,
        fontWeight: '800',
    },
    statusText: {
        marginTop: 6,
        color: theme.colors.darkText,
        fontSize: 13,
        fontWeight: '700',
        lineHeight: 19,
    },
    statusCaption: {
        marginTop: 8,
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        lineHeight: 18,
    },
    metricGrid: {
        marginTop: 14,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    metricCard: {
        width: '48.3%',
        borderRadius: 22,
        backgroundColor: theme.colors.darkSurface,
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
        marginTop: 8,
        color: theme.colors.darkText,
        fontSize: 28,
        fontWeight: '800',
    },
    metricSuffix: {
        marginTop: 4,
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        fontWeight: '700',
    },
    cardDark: {
        marginTop: 16,
        borderRadius: 26,
        backgroundColor: theme.colors.darkSurface,
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
    headerActions: {
        flexDirection: 'row',
        gap: 8,
    },
    sectionTitleDark: {
        color: theme.colors.darkText,
        fontSize: 18,
        fontWeight: '800',
    },
    sectionMetaDark: {
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        fontWeight: '700',
    },
    secondaryButton: {
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    secondaryButtonText: {
        color: theme.colors.darkText,
        fontSize: 13,
        fontWeight: '700',
    },
    macroGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    macroCard: {
        width: '48.4%',
        borderRadius: 20,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        padding: 14,
    },
    macroCardLabel: {
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    macroCardValue: {
        marginTop: 8,
        color: theme.colors.darkText,
        fontSize: 24,
        fontWeight: '800',
    },
    macroCardNote: {
        marginTop: 6,
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        lineHeight: 18,
    },
    fieldLabelDark: {
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
        marginBottom: 8,
    },
    composerRow: {
        flexDirection: 'row',
        gap: 10,
        alignItems: 'center',
        marginBottom: 10,
    },
    composerInput: {
        flex: 1,
        minHeight: 48,
        borderRadius: 16,
        backgroundColor: theme.colors.darkBackground,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 14,
        color: theme.colors.darkText,
        fontSize: 14,
    },
    composerInputSmall: {
        flex: 0.5,
    },
    composerButton: {
        borderRadius: 16,
        backgroundColor: theme.colors.accent,
        paddingHorizontal: 14,
        minHeight: 48,
        alignItems: 'center',
        justifyContent: 'center',
    },
    composerButtonText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '800',
    },
    presetRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 8,
    },
    presetChip: {
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    presetChipText: {
        color: theme.colors.darkText,
        fontSize: 12,
        fontWeight: '700',
    },
    listRowDark: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderTopWidth: 1,
        borderTopColor: theme.colors.darkLine,
    },
    listCopy: {
        flex: 1,
        paddingRight: 12,
    },
    listTitleDark: {
        color: theme.colors.darkText,
        fontSize: 15,
        fontWeight: '700',
    },
    listMetaDark: {
        marginTop: 4,
        color: theme.colors.darkTextSoft,
        fontSize: 12,
        lineHeight: 18,
    },
    listValueDark: {
        color: theme.colors.fitnessBlue,
        fontSize: 20,
        fontWeight: '800',
    },
    listRight: {
        alignItems: 'flex-end',
        gap: 8,
    },
    removeButton: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: theme.colors.darkSurfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
    },
    cheatTextDark: {
        marginTop: 10,
        color: theme.colors.darkTextSoft,
        fontSize: 14,
        lineHeight: 20,
    },
    secondaryButtonDark: {
        borderRadius: theme.radius.pill,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        paddingHorizontal: 14,
        paddingVertical: 10,
    },
    secondaryButtonTextDark: {
        color: theme.colors.darkText,
        fontSize: 13,
        fontWeight: '700',
    },
    snapshotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    snapshotPill: {
        width: '47.5%',
        borderRadius: 18,
        backgroundColor: theme.colors.darkSurfaceAlt,
        borderWidth: 1,
        borderColor: theme.colors.darkLine,
        padding: 12,
        gap: 4,
    },
    snapshotLabel: {
        color: theme.colors.darkTextSoft,
        fontSize: 11,
        fontWeight: '700',
        textTransform: 'uppercase',
        letterSpacing: 0.6,
    },
    snapshotValue: {
        color: theme.colors.darkText,
        fontSize: 16,
        fontWeight: '800',
    },
});
