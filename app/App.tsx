import { StatusBar } from 'expo-status-bar';
import {
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useState } from 'react';

type TabKey = 'home' | 'myspace' | 'sentri' | 'calorie' | 'hangout';

type TimetableCard = {
  slot: string;
  subject: string;
  location: string;
  note: string;
  tone: 'amber' | 'blue' | 'green';
};

type VaultCard = {
  title: string;
  caption: string;
  label: string;
};

type CalorieMeal = {
  name: string;
  calories: string;
  macro: string;
};

type HangoutRoom = {
  title: string;
  detail: string;
  status: string;
};

type WeeklyRefreshState = {
  effectiveLabel: string;
  nextSaturdayLabel: string;
  promptTitle: string;
  promptBody: string;
  actionLabel: string;
  urgent: boolean;
};

const theme = {
  background: '#F7F2EA',
  surface: '#FFFDFC',
  surfaceMuted: '#F1E8DB',
  foreground: '#181512',
  secondary: '#6B6057',
  accent: '#F16436',
  accentMuted: '#FFD8CA',
  accentDeep: '#D84A1C',
  sky: '#4A7BFF',
  skyMuted: '#DCE6FF',
  green: '#9ACD32',
  greenMuted: '#E9F7CC',
  line: '#E5D7C8',
  shadow: 'rgba(38, 18, 7, 0.08)',
  drawer: '#1C1714',
  drawerMuted: '#CBB59D',
};

const timetableCards: TimetableCard[] = [
  {
    slot: '11:00 - 12:00',
    subject: 'Project Management',
    location: 'LH 20',
    note: 'Bring sprint notes and assignment sheet.',
    tone: 'amber',
  },
  {
    slot: '12:45 - 1:45',
    subject: 'DBMS',
    location: 'VI Lab',
    note: 'Parallel databases discussion with lab group.',
    tone: 'blue',
  },
  {
    slot: '1:45 - 2:45',
    subject: 'Probability & Statistics',
    location: 'SG Block',
    note: 'Quick revision on discrete distribution.',
    tone: 'green',
  },
];

const vaultCards: VaultCard[] = [
  {
    title: 'OS Blackboard Snapshot',
    caption: 'Z-buffer explanation and stepwise notes',
    label: 'Image + OCR',
  },
  {
    title: 'Campus Placement Prep',
    caption: 'Aptitude shortlist, coding sheet, and drive links',
    label: 'Link bundle',
  },
  {
    title: 'Mess Meal Reference',
    caption: 'Paneer, dal, rice, and whey meal estimates',
    label: 'Quick note',
  },
];

const calorieMeals: CalorieMeal[] = [
  { name: 'Breakfast', calories: '540 kcal', macro: '26g protein' },
  { name: 'Lunch', calories: '690 kcal', macro: '31g protein' },
  { name: 'Evening', calories: '320 kcal', macro: '24g protein' },
];

const hangoutRooms: HangoutRoom[] = [
  {
    title: 'Friday Movie Room',
    detail: '12 friends, low-latency sync prototype',
    status: 'Planning',
  },
  {
    title: 'DSA Sprint Group',
    detail: 'Voice room with timer and shared agenda',
    status: 'Live',
  },
  {
    title: 'Gym Accountability',
    detail: 'Daily check-in room and meal posting',
    status: 'Today 8 PM',
  },
];

const timetableEffectiveFrom = new Date('2026-03-23T00:00:00');

function formatShortDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
  }).format(date);
}

function startOfAcademicWeek(date: Date) {
  const result = new Date(date);
  const weekday = result.getDay();
  const distanceFromMonday = weekday === 0 ? 6 : weekday - 1;
  result.setDate(result.getDate() - distanceFromMonday);
  result.setHours(0, 0, 0, 0);
  return result;
}

function nextSaturdayFrom(date: Date) {
  const result = new Date(date);
  const weekday = result.getDay();
  const daysUntilSaturday = (6 - weekday + 7) % 7;
  result.setDate(result.getDate() + daysUntilSaturday);
  result.setHours(0, 0, 0, 0);
  return result;
}

function buildWeeklyRefreshState() {
  const today = new Date();
  const currentWeekStart = startOfAcademicWeek(today);
  const timetableWeekStart = startOfAcademicWeek(timetableEffectiveFrom);
  const refreshCutoff = nextSaturdayFrom(timetableWeekStart);
  const promptIsUrgent = today >= refreshCutoff || currentWeekStart > timetableWeekStart;

  if (promptIsUrgent) {
    return {
      effectiveLabel: formatShortDate(timetableEffectiveFrom),
      nextSaturdayLabel: formatShortDate(nextSaturdayFrom(today)),
      promptTitle: 'Time to refresh next week',
      promptBody:
        'AIT sends a new timetable on Saturday. Ask the student to share the latest screenshot so next week stays accurate.',
      actionLabel: 'Update timetable',
      urgent: true,
    } satisfies WeeklyRefreshState;
  }

  return {
    effectiveLabel: formatShortDate(timetableEffectiveFrom),
    nextSaturdayLabel: formatShortDate(refreshCutoff),
    promptTitle: 'Next refresh lands on Saturday',
    promptBody:
      'Keep this week active for now. On Saturday, Sentri should prompt the user to import the fresh timetable screenshot for next week.',
    actionLabel: 'Set Saturday reminder',
    urgent: false,
  } satisfies WeeklyRefreshState;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [drawerOpen, setDrawerOpen] = useState(false);

  const titleMap: Record<Exclude<TabKey, 'sentri'>, string> = {
    home: 'Home',
    myspace: 'Myspace',
    calorie: 'Calorie',
    hangout: 'Hangout',
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <View style={styles.appFrame}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>Sentri for AIT</Text>
            <Text style={styles.headerTitle}>Hey, Sahil</Text>
            <Text style={styles.headerSubtitle}>
              {activeTab === 'sentri'
                ? 'One assistant button, ready for the next step.'
                : `${titleMap[activeTab as Exclude<TabKey, 'sentri'>]} built around your student flow.`}
            </Text>
          </View>
          <Pressable onPress={() => setDrawerOpen(true)} style={styles.menuButton}>
            <Text style={styles.menuButtonText}>Menu</Text>
          </Pressable>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {activeTab === 'home' && <HomeScreen />}
          {activeTab === 'myspace' && <MyspaceScreen />}
          {activeTab === 'calorie' && <CalorieScreen />}
          {activeTab === 'hangout' && <HangoutScreen />}
          {activeTab === 'sentri' && <SentriSheet />}
        </ScrollView>

        <BottomBar activeTab={activeTab} onSelect={setActiveTab} />
        {drawerOpen && <Drawer onClose={() => setDrawerOpen(false)} />}
      </View>
    </SafeAreaView>
  );
}

function HomeScreen() {
  const weeklyRefresh = buildWeeklyRefreshState();

  return (
    <View style={styles.screenStack}>
      <Card style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View>
            <Text style={styles.heroEyebrow}>Now in focus</Text>
            <Text style={styles.heroTitle}>Project Management</Text>
            <Text style={styles.heroMeta}>SE IT-B | Week of 23 March</Text>
          </View>
          <View style={styles.heroBadge}>
            <Text style={styles.heroBadgeValue}>12m</Text>
            <Text style={styles.heroBadgeLabel}>to next bell</Text>
          </View>
        </View>
        <View style={styles.progressTrack}>
          <View style={styles.progressValue} />
        </View>
        <View style={styles.heroFooter}>
          <InfoPill label="LH 20" />
          <InfoPill label="Assignment 7" />
          <InfoPill label="Reminders on" />
        </View>
      </Card>

      <Card style={[styles.refreshCard, weeklyRefresh.urgent && styles.refreshCardUrgent]}>
        <View style={styles.refreshHeader}>
          <View style={styles.refreshCopy}>
            <Text style={styles.cardEyebrow}>Weekly timetable cycle</Text>
            <Text style={styles.sectionTitle}>{weeklyRefresh.promptTitle}</Text>
            <Text style={styles.cardBody}>{weeklyRefresh.promptBody}</Text>
          </View>
          <View style={[styles.refreshStatus, weeklyRefresh.urgent && styles.refreshStatusUrgent]}>
            <Text style={[styles.refreshStatusText, weeklyRefresh.urgent && styles.refreshStatusTextUrgent]}>
              {weeklyRefresh.urgent ? 'Due now' : 'On track'}
            </Text>
          </View>
        </View>
        <View style={styles.refreshMetaRow}>
          <InfoPill label={`Current week: ${weeklyRefresh.effectiveLabel}`} />
          <InfoPill label={`Next prompt: ${weeklyRefresh.nextSaturdayLabel}`} />
        </View>
        <Pressable style={[styles.refreshAction, weeklyRefresh.urgent && styles.refreshActionUrgent]}>
          <Text style={styles.refreshActionText}>{weeklyRefresh.actionLabel}</Text>
        </Pressable>
      </Card>

      <SectionHeader title="Today's timetable" action="Open week" />
      {timetableCards.map((card) => (
        <TimetableItem card={card} key={`${card.slot}-${card.subject}`} />
      ))}

      <Card>
        <SectionHeader title="Weekly pulse" action="Edit slots" />
        <View style={styles.pulseGrid}>
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => (
            <View key={day} style={styles.pulseColumn}>
              <Text style={styles.pulseLabel}>{day}</Text>
              <View
                style={[
                  styles.pulseBar,
                  { height: 48 + index * 12, backgroundColor: index === 3 ? theme.accentMuted : theme.surfaceMuted },
                ]}
              />
            </View>
          ))}
        </View>
      </Card>
    </View>
  );
}

function MyspaceScreen() {
  return (
    <View style={styles.screenStack}>
      <Card>
        <Text style={styles.sectionTitle}>Search your saved memory</Text>
        <TextInput
          editable={false}
          placeholder="Board photo, DBMS, assignment, whey, link..."
          placeholderTextColor={theme.secondary}
          style={styles.searchInput}
        />
        <View style={styles.filterRow}>
          <InfoPill label="Screenshots" />
          <InfoPill label="Links" />
          <InfoPill label="Notes" />
        </View>
      </Card>

      <SectionHeader title="Recent drops" action="See all" />
      {vaultCards.map((card) => (
        <Card key={card.title}>
          <View style={styles.vaultCardHeader}>
            <View>
              <Text style={styles.sectionTitle}>{card.title}</Text>
              <Text style={styles.cardBody}>{card.caption}</Text>
            </View>
            <View style={styles.vaultTag}>
              <Text style={styles.vaultTagText}>{card.label}</Text>
            </View>
          </View>
        </Card>
      ))}

      <Card style={styles.highlightCard}>
        <Text style={styles.sectionTitle}>Why this works for students</Text>
        <Text style={styles.cardBody}>
          Share a screenshot to Sentri, extract the text, tag it by subject, and bring it back the moment you search.
        </Text>
      </Card>
    </View>
  );
}

function CalorieScreen() {
  return (
    <View style={styles.screenStack}>
      <Card style={styles.calorieHero}>
        <Text style={styles.heroEyebrow}>Today's intake</Text>
        <Text style={styles.heroTitle}>1,550 / 2,200 kcal</Text>
        <Text style={styles.heroMeta}>Built for Indian meals, not generic Western logs.</Text>
        <View style={styles.macroRow}>
          <MacroStat label="Protein" value="81g" tone="green" />
          <MacroStat label="Carbs" value="166g" tone="amber" />
          <MacroStat label="Fats" value="48g" tone="blue" />
        </View>
      </Card>

      <SectionHeader title="Meals" action="Add meal" />
      {calorieMeals.map((meal) => (
        <Card key={meal.name}>
          <View style={styles.mealRow}>
            <View>
              <Text style={styles.sectionTitle}>{meal.name}</Text>
              <Text style={styles.cardBody}>{meal.macro}</Text>
            </View>
            <Text style={styles.mealCalories}>{meal.calories}</Text>
          </View>
        </Card>
      ))}

      <Card>
        <SectionHeader title="Student staples" action="Edit list" />
        <View style={styles.filterRow}>
          <InfoPill label="Eggs" />
          <InfoPill label="Paneer" />
          <InfoPill label="Dal Rice" />
          <InfoPill label="Whey" />
        </View>
      </Card>
    </View>
  );
}

function HangoutScreen() {
  return (
    <View style={styles.screenStack}>
      <Card style={styles.hangoutHero}>
        <Text style={styles.heroEyebrow}>Campus social</Text>
        <Text style={styles.heroTitle}>Rooms, plans, and sync later</Text>
        <Text style={styles.heroMeta}>
          We keep the same visual system, but the product scope stays realistic for launch.
        </Text>
      </Card>

      <SectionHeader title="Active rooms" action="Create room" />
      {hangoutRooms.map((room) => (
        <Card key={room.title}>
          <View style={styles.roomRow}>
            <View style={styles.roomBadge}>
              <Text style={styles.roomBadgeText}>S</Text>
            </View>
            <View style={styles.roomText}>
              <Text style={styles.sectionTitle}>{room.title}</Text>
              <Text style={styles.cardBody}>{room.detail}</Text>
            </View>
            <Text style={styles.roomStatus}>{room.status}</Text>
          </View>
        </Card>
      ))}
    </View>
  );
}

function SentriSheet() {
  return (
    <View style={styles.screenStack}>
      <Card style={styles.sentriCard}>
        <Text style={styles.heroEyebrow}>Sentri assistant</Text>
        <Text style={styles.heroTitle}>Ask anything</Text>
        <Text style={styles.heroMeta}>
          This is a placeholder shell for the future assistant entry point.
        </Text>
        <TextInput
          editable={false}
          placeholder="Ask about timetable, notes, calories, or your day..."
          placeholderTextColor={theme.secondary}
          style={styles.assistantInput}
        />
        <View style={styles.filterRow}>
          <InfoPill label="Text" />
          <InfoPill label="Voice" />
          <InfoPill label="Quick actions" />
        </View>
      </Card>
    </View>
  );
}

function Drawer({ onClose }: { onClose: () => void }) {
  return (
    <View style={styles.drawerBackdrop}>
      <Pressable onPress={onClose} style={styles.drawerDismiss} />
      <View style={styles.drawerPanel}>
        <Text style={styles.drawerEyebrow}>Account</Text>
        <Text style={styles.drawerName}>Sahil Singh</Text>
        <Text style={styles.drawerEmail}>ait.student@sentri.demo</Text>

        <View style={styles.drawerList}>
          {['Profile', 'Notifications', 'Saved imports', 'Theme', 'About Sentri'].map((item) => (
            <View key={item} style={styles.drawerItem}>
              <Text style={styles.drawerItemText}>{item}</Text>
            </View>
          ))}
        </View>

        <Pressable onPress={onClose} style={styles.drawerButton}>
          <Text style={styles.drawerButtonText}>Close drawer</Text>
        </Pressable>
      </View>
    </View>
  );
}

function BottomBar({
  activeTab,
  onSelect,
}: {
  activeTab: TabKey;
  onSelect: (tab: TabKey) => void;
}) {
  return (
    <View style={styles.bottomBar}>
      <BottomBarItem active={activeTab === 'home'} label="Home" onPress={() => onSelect('home')} />
      <BottomBarItem active={activeTab === 'myspace'} label="Myspace" onPress={() => onSelect('myspace')} />
      <Pressable onPress={() => onSelect('sentri')} style={styles.centerAction}>
        <Text style={styles.centerActionMark}>S</Text>
      </Pressable>
      <BottomBarItem active={activeTab === 'calorie'} label="Calorie" onPress={() => onSelect('calorie')} />
      <BottomBarItem active={activeTab === 'hangout'} label="Hangout" onPress={() => onSelect('hangout')} />
    </View>
  );
}

function BottomBarItem({
  active,
  label,
  onPress,
}: {
  active: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.bottomBarItem}>
      <View style={[styles.bottomBarDot, active && styles.bottomBarDotActive]} />
      <Text style={[styles.bottomBarLabel, active && styles.bottomBarLabelActive]}>{label}</Text>
    </Pressable>
  );
}

function TimetableItem({ card }: { card: TimetableCard }) {
  const toneMap = {
    amber: { backgroundColor: theme.accentMuted, textColor: theme.accentDeep },
    blue: { backgroundColor: theme.skyMuted, textColor: theme.sky },
    green: { backgroundColor: theme.greenMuted, textColor: '#608200' },
  };

  const tone = toneMap[card.tone];

  return (
    <Card>
      <View style={styles.itemRow}>
        <View style={styles.itemText}>
          <Text style={styles.cardEyebrow}>{card.slot}</Text>
          <Text style={styles.sectionTitle}>{card.subject}</Text>
          <Text style={styles.cardBody}>{card.note}</Text>
        </View>
        <View style={[styles.slotBadge, { backgroundColor: tone.backgroundColor }]}>
          <Text style={[styles.slotBadgeText, { color: tone.textColor }]}>{card.location}</Text>
        </View>
      </View>
    </Card>
  );
}

function SectionHeader({ title, action }: { title: string; action: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionHeaderTitle}>{title}</Text>
      <Text style={styles.sectionAction}>{action}</Text>
    </View>
  );
}

function MacroStat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: 'amber' | 'blue' | 'green';
}) {
  const toneMap = {
    amber: theme.accentMuted,
    blue: theme.skyMuted,
    green: theme.greenMuted,
  };

  return (
    <View style={[styles.macroStat, { backgroundColor: toneMap[tone] }]}>
      <Text style={styles.cardEyebrow}>{label}</Text>
      <Text style={styles.macroValue}>{value}</Text>
    </View>
  );
}

function InfoPill({ label }: { label: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillText}>{label}</Text>
    </View>
  );
}

function Card({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: object;
}) {
  return <View style={[styles.card, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  appFrame: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  eyebrow: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  headerTitle: {
    marginTop: 8,
    color: theme.foreground,
    fontSize: 34,
    fontWeight: '800',
    lineHeight: 40,
  },
  headerSubtitle: {
    marginTop: 4,
    maxWidth: 240,
    color: theme.secondary,
    fontSize: 15,
    lineHeight: 22,
  },
  menuButton: {
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 6,
  },
  menuButtonText: {
    color: theme.foreground,
    fontSize: 14,
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 10,
    paddingBottom: 124,
  },
  screenStack: {
    gap: 14,
  },
  card: {
    backgroundColor: theme.surface,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.line,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 22,
    elevation: 8,
  },
  heroCard: {
    backgroundColor: theme.foreground,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  heroEyebrow: {
    color: theme.accent,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  heroTitle: {
    marginTop: 8,
    color: '#FFF6EF',
    fontSize: 28,
    fontWeight: '800',
  },
  heroMeta: {
    marginTop: 6,
    color: '#DCCCBD',
    fontSize: 14,
    lineHeight: 20,
  },
  heroBadge: {
    minWidth: 84,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  heroBadgeValue: {
    color: '#FFF6EF',
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
  },
  heroBadgeLabel: {
    marginTop: 4,
    color: '#DCCCBD',
    fontSize: 12,
    textAlign: 'center',
  },
  progressTrack: {
    marginTop: 18,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  progressValue: {
    width: '58%',
    height: '100%',
    backgroundColor: theme.accent,
    borderRadius: 999,
  },
  heroFooter: {
    marginTop: 18,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  infoPill: {
    backgroundColor: theme.surfaceMuted,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  infoPillText: {
    color: theme.foreground,
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 2,
  },
  sectionHeaderTitle: {
    color: theme.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
  sectionAction: {
    color: theme.accentDeep,
    fontSize: 14,
    fontWeight: '700',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  itemText: {
    flex: 1,
  },
  cardEyebrow: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sectionTitle: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 19,
    fontWeight: '800',
    lineHeight: 24,
  },
  cardBody: {
    marginTop: 8,
    color: theme.secondary,
    fontSize: 14,
    lineHeight: 21,
  },
  slotBadge: {
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  slotBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pulseGrid: {
    marginTop: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  pulseColumn: {
    alignItems: 'center',
    gap: 10,
  },
  pulseLabel: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '700',
  },
  pulseBar: {
    width: 38,
    borderRadius: 999,
  },
  searchInput: {
    marginTop: 14,
    backgroundColor: theme.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.foreground,
    fontSize: 15,
  },
  filterRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  vaultCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  vaultTag: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    backgroundColor: theme.skyMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  vaultTagText: {
    color: theme.sky,
    fontSize: 12,
    fontWeight: '800',
  },
  highlightCard: {
    backgroundColor: theme.surfaceMuted,
  },
  refreshCard: {
    backgroundColor: '#FFF2EB',
  },
  refreshCardUrgent: {
    backgroundColor: '#FFE2D6',
  },
  refreshHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 16,
  },
  refreshCopy: {
    flex: 1,
  },
  refreshStatus: {
    borderRadius: 999,
    backgroundColor: theme.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  refreshStatusUrgent: {
    backgroundColor: theme.accent,
  },
  refreshStatusText: {
    color: theme.foreground,
    fontSize: 12,
    fontWeight: '800',
  },
  refreshStatusTextUrgent: {
    color: '#FFF6EF',
  },
  refreshMetaRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  refreshAction: {
    marginTop: 16,
    alignSelf: 'flex-start',
    borderRadius: 18,
    backgroundColor: theme.foreground,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  refreshActionUrgent: {
    backgroundColor: theme.accentDeep,
  },
  refreshActionText: {
    color: '#FFF6EF',
    fontSize: 14,
    fontWeight: '800',
  },
  calorieHero: {
    backgroundColor: '#21251A',
  },
  macroRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  macroStat: {
    flex: 1,
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  macroValue: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 18,
    fontWeight: '800',
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 16,
  },
  mealCalories: {
    color: theme.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  hangoutHero: {
    backgroundColor: '#1F1B18',
  },
  roomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  roomBadge: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: theme.accentMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  roomBadgeText: {
    color: theme.accentDeep,
    fontSize: 18,
    fontWeight: '800',
  },
  roomText: {
    flex: 1,
  },
  roomStatus: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '800',
  },
  sentriCard: {
    backgroundColor: '#1D1714',
  },
  assistantInput: {
    marginTop: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    color: '#FFF6EF',
    fontSize: 15,
  },
  bottomBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: theme.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 10,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  bottomBarItem: {
    width: 64,
    alignItems: 'center',
    gap: 6,
  },
  bottomBarDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: theme.line,
  },
  bottomBarDotActive: {
    backgroundColor: theme.accent,
  },
  bottomBarLabel: {
    color: theme.secondary,
    fontSize: 11,
    fontWeight: '700',
  },
  bottomBarLabelActive: {
    color: theme.foreground,
  },
  centerAction: {
    marginTop: -28,
    width: 72,
    height: 72,
    borderRadius: 24,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  centerActionMark: {
    color: '#FFF6EF',
    fontSize: 28,
    fontWeight: '900',
  },
  drawerBackdrop: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  drawerDismiss: {
    flex: 1,
    backgroundColor: 'rgba(12, 8, 6, 0.24)',
  },
  drawerPanel: {
    width: 286,
    backgroundColor: theme.drawer,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 32,
  },
  drawerEyebrow: {
    color: theme.drawerMuted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
  },
  drawerName: {
    marginTop: 10,
    color: '#FFF6EF',
    fontSize: 28,
    fontWeight: '800',
  },
  drawerEmail: {
    marginTop: 6,
    color: theme.drawerMuted,
    fontSize: 14,
  },
  drawerList: {
    marginTop: 28,
    gap: 12,
  },
  drawerItem: {
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  drawerItemText: {
    color: '#FFF6EF',
    fontSize: 15,
    fontWeight: '700',
  },
  drawerButton: {
    marginTop: 28,
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.accent,
    paddingVertical: 15,
  },
  drawerButtonText: {
    color: '#FFF6EF',
    fontSize: 15,
    fontWeight: '800',
  },
});
