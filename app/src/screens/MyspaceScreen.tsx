import { useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme as sharedTheme } from '../design/tokens';

import {
  captureOptions,
  savedItems,
  searchSavedItems,
  subjectChips,
  type CaptureOption,
  type SavedItem,
} from './myspace/data';

type MyspaceScreenState = 'ready' | 'loading' | 'error' | 'empty' | 'success';

const theme = {
  background: sharedTheme.colors.background,
  surface: sharedTheme.colors.surface,
  surfaceMuted: sharedTheme.colors.surfaceAlt,
  foreground: sharedTheme.colors.text,
  secondary: sharedTheme.colors.textSoft,
  accent: sharedTheme.colors.accent,
  accentMuted: sharedTheme.colors.accentSoft,
  accentDeep: sharedTheme.colors.accentStrong,
  sky: sharedTheme.colors.blue,
  skyMuted: sharedTheme.colors.blueSoft,
  mint: sharedTheme.colors.mint,
  mintMuted: sharedTheme.colors.mintSoft,
  rose: sharedTheme.colors.rose,
  roseMuted: sharedTheme.colors.roseSoft,
  sandMuted: '#F3E6D2',
  line: sharedTheme.colors.line,
  shadow: 'rgba(38, 18, 7, 0.08)',
};

const accentMap = {
  sand: {
    backgroundColor: theme.sandMuted,
    strip: '#D9C19A',
  },
  sky: {
    backgroundColor: theme.skyMuted,
    strip: theme.sky,
  },
  mint: {
    backgroundColor: theme.mintMuted,
    strip: theme.mint,
  },
  rose: {
    backgroundColor: theme.roseMuted,
    strip: theme.rose,
  },
  ink: {
    backgroundColor: '#EEE8DE',
    strip: '#40362B',
  },
} as const;

export default function MyspaceScreen() {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [screenState] = useState<MyspaceScreenState>('ready');

  const filteredItems = searchSavedItems(savedItems, query, subject);
  const pinnedItems = filteredItems.filter((item) => item.pinned);
  const recentItems = filteredItems.filter((item) => !item.pinned);
  const suggestedItems = filteredItems.filter((item) => item.featured);
  const gridColumns = splitIntoColumns(recentItems);

  if (screenState !== 'ready') {
    return <MyspaceStatePanel state={screenState} />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.kicker}>Myspace</Text>
            <Text style={styles.title}>Search what you saved</Text>
            <Text style={styles.subtitle}>
              A calm capture space for screenshots, links, notes, files, and board photos.
            </Text>
          </View>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeValue}>{filteredItems.length}</Text>
            <Text style={styles.headerBadgeLabel}>saved</Text>
          </View>
        </View>

        <View style={styles.searchCard}>
          <TextInput
            placeholder="Search blackboard, DBMS, interview, math, date..."
            placeholderTextColor={theme.secondary}
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            returnKeyType="search"
          />
          <Text style={styles.searchHint}>
            Search by OCR text, subject, source, date, or the thing you remember first.
          </Text>
        </View>

        <View style={styles.chipsWrap}>
          {subjectChips.map((chip) => (
            <SubjectChip
              key={chip}
              label={chip}
              active={chip === subject}
              onPress={() => setSubject(chip)}
            />
          ))}
        </View>

        <View style={styles.summaryRow}>
          <SummaryPill label="Pinned" value={pinnedItems.length.toString()} />
          <SummaryPill label="Recent" value={recentItems.length.toString()} />
          <SummaryPill label="Surfacing" value={suggestedItems.length.toString()} />
        </View>

        {pinnedItems.length > 0 && (
          <Section title="Pinned" action="Keep close">
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRow}>
              {pinnedItems.map((item) => (
                <PillCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
              ))}
            </ScrollView>
          </Section>
        )}

        <Section title={query ? 'Search results' : 'Recent items'} action={query ? 'Refined by search' : 'Latest capture'}>
          <View style={styles.grid}>
            <View style={styles.column}>{gridColumns[0].map((item) => <TileCard key={item.id} item={item} query={query} onPress={() => setSelectedItem(item)} />)}</View>
            <View style={styles.column}>{gridColumns[1].map((item) => <TileCard key={item.id} item={item} query={query} onPress={() => setSelectedItem(item)} />)}</View>
          </View>
        </Section>

        <Section title="Suggested resurfacing" action="Useful today">
          {suggestedItems.slice(0, 3).map((item) => (
            <ResurfaceRow key={item.id} item={item} onPress={() => setSelectedItem(item)} />
          ))}
        </Section>

        {filteredItems.length === 0 && (
          <EmptyState
            title="Nothing matched yet"
            description="Try a different subject chip, a board phrase, a date, or an OCR keyword from the saved image."
          />
        )}
      </ScrollView>

      <Pressable onPress={() => setAddSheetOpen(true)} style={styles.fab} accessibilityRole="button">
        <Text style={styles.fabPlus}>+</Text>
      </Pressable>

      <AddSheet open={addSheetOpen} onClose={() => setAddSheetOpen(false)} />
      <DetailSheet item={selectedItem} query={query} onClose={() => setSelectedItem(null)} />
    </SafeAreaView>
  );
}

function Section({
  title,
  action,
  children,
}: {
  title: string;
  action: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionAction}>{action}</Text>
      </View>
      {children}
    </View>
  );
}

function SubjectChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}>
      <Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function PillCard({ item, onPress }: { item: SavedItem; onPress: () => void }) {
  const accent = accentMap[item.accent];

  return (
    <Pressable onPress={onPress} style={[styles.pillCard, { backgroundColor: accent.backgroundColor }]}>
      <View style={[styles.pillStrip, { backgroundColor: accent.strip }]} />
      <Text style={styles.pillSubject}>{item.subject}</Text>
      <Text style={styles.pillTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.pillBody} numberOfLines={3}>
        {item.body}
      </Text>
      <Text style={styles.pillMeta}>
        {item.source} · {item.dateLabel}
      </Text>
    </Pressable>
  );
}

function TileCard({
  item,
  query,
  onPress,
}: {
  item: SavedItem;
  query: string;
  onPress: () => void;
}) {
  const accent = accentMap[item.accent];
  const matchLabel = getMatchLabel(item, query);

  return (
    <Pressable onPress={onPress} style={[styles.tileCard, { backgroundColor: accent.backgroundColor }]}>
      <View style={[styles.tileStrip, { backgroundColor: accent.strip }]} />
      <View style={styles.tileTopRow}>
        <Text style={styles.tileKind}>{item.kind.toUpperCase()}</Text>
        {item.pinned ? <Text style={styles.tilePinned}>PINNED</Text> : null}
      </View>
      <Text style={styles.tileTitle}>{item.title}</Text>
      <Text style={styles.tileBody} numberOfLines={4}>
        {item.body}
      </Text>
      <View style={styles.tileFooter}>
        <Text style={styles.tileMeta}>{item.subject}</Text>
        <Text style={styles.tileMeta}>{item.dateLabel}</Text>
      </View>
      <Text style={styles.tileMatch}>{matchLabel}</Text>
    </Pressable>
  );
}

function ResurfaceRow({ item, onPress }: { item: SavedItem; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.resurfaceRow}>
      <View style={styles.resurfaceDot} />
      <View style={styles.resurfaceText}>
        <Text style={styles.resurfaceTitle}>{item.title}</Text>
        <Text style={styles.resurfaceMeta}>
          {item.subject} · {item.source} · {item.dateLabel}
        </Text>
      </View>
    </Pressable>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{description}</Text>
    </View>
  );
}

function MyspaceStatePanel({ state }: { state: Exclude<MyspaceScreenState, 'ready'> }) {
  const copy = {
    loading: {
      title: 'Searching your memory',
      body: 'Sentri is indexing your saved screenshots, files, links, and OCR text.',
    },
    error: {
      title: 'Could not load Myspace',
      body: 'Try again after reconnecting or retry the last import.',
    },
    empty: {
      title: 'Nothing saved yet',
      body: 'Use the plus button to add a screenshot, note, file, or link into Myspace.',
    },
    success: {
      title: 'Saved to Myspace',
      body: 'Your latest item is indexed and ready for dynamic search.',
    },
  } as const;

  const content = copy[state];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.statePanel}>
        <Text style={styles.kicker}>Myspace</Text>
        <Text style={styles.title}>{content.title}</Text>
        <Text style={styles.subtitle}>{content.body}</Text>
      </View>
    </SafeAreaView>
  );
}

function AddSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.sheet}>
        <Text style={styles.sheetKicker}>Capture</Text>
        <Text style={styles.sheetTitle}>What do you want to save?</Text>
        <Text style={styles.sheetBody}>
          Add from share sheet, camera, files, or a quick note. Sentri can sort it out later.
        </Text>
        <View style={styles.optionList}>
          {captureOptions.map((option) => (
            <CaptureOptionRow key={option.id} option={option} />
          ))}
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function CaptureOptionRow({ option }: { option: CaptureOption }) {
  return (
    <Pressable style={styles.captureRow}>
      <View style={styles.captureIcon}>
        <Text style={styles.captureIconText}>{option.symbol.slice(0, 1).toUpperCase()}</Text>
      </View>
      <View style={styles.captureText}>
        <Text style={styles.captureTitle}>{option.label}</Text>
        <Text style={styles.captureHint}>{option.hint}</Text>
      </View>
      <Text style={styles.captureArrow}>Add</Text>
    </Pressable>
  );
}

function DetailSheet({
  item,
  query,
  onClose,
}: {
  item: SavedItem | null;
  query: string;
  onClose: () => void;
}) {
  if (!item) {
    return null;
  }

  const accent = accentMap[item.accent];
  const matchLabel = getMatchLabel(item, query);

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.sheetBackdrop} onPress={onClose} />
      <View style={styles.detailSheet}>
        <View style={[styles.detailAccent, { backgroundColor: accent.strip }]} />
        <Text style={styles.detailKicker}>{item.subject}</Text>
        <Text style={styles.detailTitle}>{item.title}</Text>
        <Text style={styles.detailBody}>{item.body}</Text>
        <View style={styles.detailMetaRow}>
          <MetaPill label={item.kind} />
          <MetaPill label={item.source} />
          <MetaPill label={item.dateLabel} />
        </View>
        <Text style={styles.detailMatch}>{matchLabel}</Text>
        <View style={styles.detailActions}>
          <ActionButton label="Copy" />
          <ActionButton label="Share" filled />
          <ActionButton label={item.pinned ? 'Pinned' : 'Pin'} />
        </View>
        <Pressable onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Done</Text>
        </Pressable>
      </View>
    </Modal>
  );
}

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

function ActionButton({ label, filled = false }: { label: string; filled?: boolean }) {
  return (
    <Pressable style={[styles.actionButton, filled && styles.actionButtonFilled]}>
      <Text style={[styles.actionButtonText, filled && styles.actionButtonTextFilled]}>{label}</Text>
    </Pressable>
  );
}

function splitIntoColumns(items: SavedItem[]) {
  const left: SavedItem[] = [];
  const right: SavedItem[] = [];

  items.forEach((item, index) => {
    if (index % 2 === 0) {
      left.push(item);
    } else {
      right.push(item);
    }
  });

  return [left, right];
}

function getMatchLabel(item: SavedItem, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return item.featured ? 'Suggested from recent context' : 'Recently captured';
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const ocrText = (item.ocrText ?? '').toLowerCase();

  if (tokens.some((token) => item.title.toLowerCase().includes(token))) {
    return 'Matched title';
  }
  if (tokens.some((token) => item.subject.toLowerCase().includes(token))) {
    return 'Matched subject';
  }
  if (tokens.some((token) => item.source.toLowerCase().includes(token))) {
    return 'Matched source';
  }
  if (tokens.some((token) => ocrText.includes(token))) {
    return 'Matched OCR text';
  }
  if (tokens.some((token) => item.tags.some((tag) => tag.toLowerCase().includes(token)))) {
    return 'Matched tag';
  }

  return 'Matched by context';
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.background,
  },
  statePanel: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
    gap: 10,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  kicker: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 30,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    marginTop: 6,
    maxWidth: 260,
    color: theme.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  headerBadge: {
    minWidth: 72,
    borderRadius: 22,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  headerBadgeValue: {
    color: theme.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
  headerBadgeLabel: {
    marginTop: 4,
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  searchCard: {
    borderRadius: 26,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 14,
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 8,
  },
  searchInput: {
    backgroundColor: theme.background,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: theme.foreground,
    fontSize: 15,
  },
  searchHint: {
    marginTop: 10,
    color: theme.secondary,
    fontSize: 13,
    lineHeight: 18,
  },
  chipsWrap: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: theme.surface,
    borderWidth: 1,
    borderColor: theme.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: theme.foreground,
    borderColor: theme.foreground,
  },
  chipText: {
    color: theme.secondary,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: '#FFF6EF',
  },
  summaryRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 22,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  summaryValue: {
    color: theme.foreground,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    marginTop: 4,
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    color: theme.foreground,
    fontSize: 20,
    fontWeight: '800',
  },
  sectionAction: {
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '700',
  },
  pinnedRow: {
    gap: 12,
    paddingRight: 4,
  },
  pillCard: {
    width: 238,
    borderRadius: 24,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  pillStrip: {
    height: 6,
    width: 56,
    borderRadius: 999,
    marginBottom: 12,
  },
  pillSubject: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pillTitle: {
    marginTop: 8,
    color: theme.foreground,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  pillBody: {
    marginTop: 8,
    color: theme.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  pillMeta: {
    marginTop: 12,
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  grid: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  tileCard: {
    borderRadius: 24,
    padding: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  tileStrip: {
    width: 46,
    height: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  tileTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tileKind: {
    color: theme.secondary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  tilePinned: {
    color: theme.accentDeep,
    fontSize: 11,
    fontWeight: '800',
  },
  tileTitle: {
    marginTop: 8,
    color: theme.foreground,
    fontSize: 17,
    fontWeight: '800',
    lineHeight: 22,
  },
  tileBody: {
    marginTop: 8,
    color: theme.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  tileFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tileMeta: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '700',
  },
  tileMatch: {
    marginTop: 10,
    color: theme.secondary,
    fontSize: 12,
    fontStyle: 'italic',
  },
  resurfaceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 14,
    marginBottom: 10,
  },
  resurfaceDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
    backgroundColor: theme.accent,
    marginRight: 12,
  },
  resurfaceText: {
    flex: 1,
  },
  resurfaceTitle: {
    color: theme.foreground,
    fontSize: 15,
    fontWeight: '800',
  },
  resurfaceMeta: {
    marginTop: 4,
    color: theme.secondary,
    fontSize: 12,
  },
  emptyState: {
    marginTop: 18,
    borderRadius: 24,
    backgroundColor: theme.surfaceMuted,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 18,
  },
  emptyTitle: {
    color: theme.foreground,
    fontSize: 18,
    fontWeight: '800',
  },
  emptyBody: {
    marginTop: 6,
    color: theme.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    width: 62,
    height: 62,
    borderRadius: 20,
    backgroundColor: theme.accent,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: theme.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 1,
    shadowRadius: 18,
    elevation: 10,
  },
  fabPlus: {
    color: '#FFF6EF',
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 32,
  },
  sheetBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(12, 8, 6, 0.32)',
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  sheetKicker: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  sheetTitle: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 22,
    fontWeight: '800',
  },
  sheetBody: {
    marginTop: 6,
    color: theme.secondary,
    fontSize: 13,
    lineHeight: 19,
  },
  optionList: {
    marginTop: 16,
    gap: 10,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.line,
    padding: 14,
  },
  captureIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  captureIconText: {
    color: theme.foreground,
    fontSize: 16,
    fontWeight: '800',
  },
  captureText: {
    flex: 1,
  },
  captureTitle: {
    color: theme.foreground,
    fontSize: 15,
    fontWeight: '800',
  },
  captureHint: {
    marginTop: 3,
    color: theme.secondary,
    fontSize: 12,
  },
  captureArrow: {
    color: theme.accentDeep,
    fontSize: 12,
    fontWeight: '800',
  },
  closeButton: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: theme.foreground,
    alignItems: 'center',
    paddingVertical: 14,
  },
  closeButtonText: {
    color: '#FFF6EF',
    fontSize: 14,
    fontWeight: '800',
  },
  detailSheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    backgroundColor: theme.surface,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  detailAccent: {
    width: 58,
    height: 6,
    borderRadius: 999,
    marginBottom: 14,
  },
  detailKicker: {
    color: theme.secondary,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  detailTitle: {
    marginTop: 6,
    color: theme.foreground,
    fontSize: 24,
    fontWeight: '800',
    lineHeight: 30,
  },
  detailBody: {
    marginTop: 8,
    color: theme.secondary,
    fontSize: 14,
    lineHeight: 20,
  },
  detailMetaRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: 999,
    backgroundColor: theme.surfaceMuted,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    color: theme.foreground,
    fontSize: 12,
    fontWeight: '700',
  },
  detailMatch: {
    marginTop: 12,
    color: theme.accentDeep,
    fontSize: 13,
    fontWeight: '700',
  },
  detailActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.background,
    borderWidth: 1,
    borderColor: theme.line,
    alignItems: 'center',
    paddingVertical: 13,
  },
  actionButtonFilled: {
    backgroundColor: theme.accent,
    borderColor: theme.accent,
  },
  actionButtonText: {
    color: theme.foreground,
    fontSize: 13,
    fontWeight: '800',
  },
  actionButtonTextFilled: {
    color: '#FFF6EF',
  },
});
