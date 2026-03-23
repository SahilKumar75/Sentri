import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
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
import { AvatarButton } from '../components/sentri-ui';
import { theme } from '../design/tokens';
import {
  captureOptions,
  savedItems,
  searchSavedItems,
  subjectChips,
  type CaptureOption,
  type SavedItem,
} from './myspace/data';

type MyspaceScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

const noteTones = {
  sand: { backgroundColor: '#F2E7D4', pin: '#D2B684' },
  sky: { backgroundColor: '#DFE7FF', pin: '#4E72F5' },
  mint: { backgroundColor: '#DCEDE6', pin: '#4B8B79' },
  rose: { backgroundColor: '#F6E1E5', pin: '#BA6A73' },
  ink: { backgroundColor: '#EAE4DD', pin: '#423A33' },
} as const;

export default function MyspaceScreen({ onOpenDrawer, avatarLabel }: MyspaceScreenProps) {
  const [query, setQuery] = useState('');
  const [subject, setSubject] = useState('All');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const filteredItems = useMemo(
    () => searchSavedItems(savedItems, query, subject),
    [query, subject]
  );
  const pinnedItems = filteredItems.filter((item) => item.pinned);
  const libraryItems = filteredItems.filter((item) => !item.pinned);
  const columns = splitIntoColumns(libraryItems);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
          <View style={styles.searchShell}>
            <Ionicons name="search" size={18} color={theme.colors.textMuted} />
            <TextInput
              value={query}
              onChangeText={setQuery}
              placeholder="Search blackboard, DBMS, math, date..."
              placeholderTextColor={theme.colors.textMuted}
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>
        </View>

        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Myspace</Text>
          <Text style={styles.title}>Everything you saved, easier to find.</Text>
          <Text style={styles.subtitle}>
            Search OCR text, subject, source, date, or the thing you remember first.
          </Text>
        </View>

        {statusMessage ? (
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>{statusMessage}</Text>
          </View>
        ) : null}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {subjectChips.map((chip) => {
            const active = chip === subject;
            return (
              <Pressable
                key={chip}
                onPress={() => setSubject(chip)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{chip}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {pinnedItems.length ? (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Pinned</Text>
              <Text style={styles.sectionMeta}>Quick recall</Text>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.pinnedRow}
            >
              {pinnedItems.map((item) => (
                <PinnedCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
              ))}
            </ScrollView>
          </View>
        ) : null}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{query ? 'Results' : 'Board'}</Text>
            <Text style={styles.sectionMeta}>{filteredItems.length} notes</Text>
          </View>

          {filteredItems.length ? (
            <View style={styles.masonry}>
              <View style={styles.column}>
                {columns[0].map((item) => (
                  <NoteCard key={item.id} item={item} query={query} onPress={() => setSelectedItem(item)} />
                ))}
              </View>
              <View style={styles.column}>
                {columns[1].map((item) => (
                  <NoteCard key={item.id} item={item} query={query} onPress={() => setSelectedItem(item)} />
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyTitle}>Nothing matched yet</Text>
              <Text style={styles.emptyBody}>
                Try a board phrase, a subject chip, a date, or an OCR keyword from the saved image.
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Pressable
        onPress={() => setAddSheetOpen(true)}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Add to Myspace"
      >
        <Ionicons name="add" size={26} color="#FFF9F5" />
      </Pressable>

      <AddSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSelectOption={(option) => {
          setAddSheetOpen(false);
          setStatusMessage(`${option.label} capture staged for Myspace`);
        }}
      />
      <DetailSheet
        item={selectedItem}
        query={query}
        onClose={() => setSelectedItem(null)}
        onAction={(action, item) => {
          setStatusMessage(`${action} ready for ${item.title}`);
          if (action === 'Copy' || action === 'Share') {
            setSelectedItem(null);
          }
        }}
      />
    </View>
  );
}

function PinnedCard({ item, onPress }: { item: SavedItem; onPress: () => void }) {
  const tone = noteTones[item.accent];

  return (
    <Pressable onPress={onPress} style={[styles.pinnedCard, { backgroundColor: tone.backgroundColor }]}>
      <View style={[styles.notePin, { backgroundColor: tone.pin }]} />
      <Text style={styles.noteSubject}>{item.subject}</Text>
      <Text style={styles.pinnedTitle} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.pinnedBody} numberOfLines={3}>
        {item.body}
      </Text>
      <Text style={styles.noteMeta}>{item.source}</Text>
    </Pressable>
  );
}

function NoteCard({
  item,
  query,
  onPress,
}: {
  item: SavedItem;
  query: string;
  onPress: () => void;
}) {
  const tone = noteTones[item.accent];

  return (
    <Pressable onPress={onPress} style={[styles.noteCard, { backgroundColor: tone.backgroundColor }]}>
      <View style={[styles.notePin, { backgroundColor: tone.pin }]} />
      <Text style={styles.noteTitle}>{item.title}</Text>
      <Text style={styles.noteBody}>{item.body}</Text>
      <View style={styles.noteFooter}>
        <Text style={styles.noteMeta}>{item.subject}</Text>
        <Text style={styles.noteMeta}>{item.dateLabel}</Text>
      </View>
      <Text style={styles.matchText}>{getMatchLabel(item, query)}</Text>
    </Pressable>
  );
}

function AddSheet({
  open,
  onClose,
  onSelectOption,
}: {
  open: boolean;
  onClose: () => void;
  onSelectOption: (option: CaptureOption) => void;
}) {
  return (
    <Modal visible={open} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalScrim} onPress={onClose} />
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.sheet}>
            <Text style={styles.sheetKicker}>Add to Myspace</Text>
            <Text style={styles.sheetTitle}>What do you want to save?</Text>
            <View style={styles.sheetOptions}>
              {captureOptions.map((option) => (
                <CaptureRow key={option.id} option={option} onPress={() => onSelectOption(option)} />
              ))}
            </View>
            <Pressable onPress={onClose} style={styles.sheetClose}>
              <Text style={styles.sheetCloseText}>Close</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function CaptureRow({ option, onPress }: { option: CaptureOption; onPress: () => void }) {
  return (
    <Pressable style={styles.captureRow} onPress={onPress}>
      <View style={styles.captureIcon}>
        <Ionicons name={symbolToIcon(option.symbol)} size={18} color={theme.colors.accentStrong} />
      </View>
      <View style={styles.captureText}>
        <Text style={styles.captureTitle}>{option.label}</Text>
        <Text style={styles.captureHint}>{option.hint}</Text>
      </View>
      <Text style={styles.captureAction}>Add</Text>
    </Pressable>
  );
}

function DetailSheet({
  item,
  query,
  onClose,
  onAction,
}: {
  item: SavedItem | null;
  query: string;
  onClose: () => void;
  onAction: (action: 'Copy' | 'Share', item: SavedItem) => void;
}) {
  if (!item) {
    return null;
  }

  return (
    <Modal visible transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalScrim} onPress={onClose} />
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.detailSheet}>
            <Text style={styles.sheetKicker}>{item.subject}</Text>
            <Text style={styles.detailTitle}>{item.title}</Text>
            <Text style={styles.detailBody}>{item.body}</Text>
            <View style={styles.detailMetaRow}>
              <MetaChip label={item.kind} />
              <MetaChip label={item.source} />
              <MetaChip label={item.dateLabel} />
            </View>
            <Text style={styles.detailMatch}>{getMatchLabel(item, query)}</Text>
            <View style={styles.detailActions}>
              <Pressable style={styles.detailAction} onPress={() => onAction('Copy', item)}>
                <Text style={styles.detailActionText}>Copy</Text>
              </Pressable>
              <Pressable
                style={[styles.detailAction, styles.detailActionFilled]}
                onPress={() => onAction('Share', item)}
              >
                <Text style={[styles.detailActionText, styles.detailActionTextFilled]}>Share</Text>
              </Pressable>
            </View>
            <Pressable onPress={onClose} style={styles.sheetClose}>
              <Text style={styles.sheetCloseText}>Done</Text>
            </Pressable>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

function MetaChip({ label }: { label: string }) {
  return (
    <View style={styles.metaChip}>
      <Text style={styles.metaChipText}>{label}</Text>
    </View>
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
    return item.featured ? 'Suggested from recent context' : 'Search by date, OCR, or subject';
  }

  const tokens = normalized.split(/\s+/).filter(Boolean);
  const ocrText = (item.ocrText ?? '').toLowerCase();

  if (tokens.some((token) => item.title.toLowerCase().includes(token))) return 'Matched title';
  if (tokens.some((token) => item.subject.toLowerCase().includes(token))) return 'Matched subject';
  if (tokens.some((token) => item.source.toLowerCase().includes(token))) return 'Matched source';
  if (tokens.some((token) => item.dateLabel.toLowerCase().includes(token))) return 'Matched date';
  if (tokens.some((token) => ocrText.includes(token))) return 'Matched OCR text';
  if (tokens.some((token) => item.tags.some((tag) => tag.toLowerCase().includes(token)))) return 'Matched tag';

  return 'Matched by context';
}

function symbolToIcon(symbol: string): keyof typeof Ionicons.glyphMap {
  if (symbol === 'link') return 'link-outline';
  if (symbol === 'doc') return 'document-outline';
  if (symbol === 'note.text') return 'create-outline';
  if (symbol === 'rectangle.on.rectangle') return 'copy-outline';
  return 'image-outline';
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
  searchShell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
    ...theme.shadow.soft,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
  },
  headerCopy: {
    marginTop: 18,
    gap: 4,
  },
  kicker: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.9,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.colors.text,
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  statusBanner: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusBannerText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  chipRow: {
    marginTop: 16,
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    borderRadius: 999,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: theme.colors.surfaceStrong,
    borderColor: theme.colors.surfaceStrong,
  },
  chipText: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  chipTextActive: {
    color: theme.colors.surface,
  },
  section: {
    marginTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sectionMeta: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  pinnedRow: {
    gap: 12,
    paddingRight: 4,
  },
  pinnedCard: {
    width: 220,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.04)',
  },
  masonry: {
    flexDirection: 'row',
    gap: 12,
  },
  column: {
    flex: 1,
    gap: 12,
  },
  noteCard: {
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  notePin: {
    width: 52,
    height: 6,
    borderRadius: 999,
    marginBottom: 12,
  },
  noteSubject: {
    color: theme.colors.textSoft,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  pinnedTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 22,
  },
  pinnedBody: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 19,
  },
  noteTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 23,
  },
  noteBody: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  noteFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  noteMeta: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '700',
  },
  matchText: {
    marginTop: 10,
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  emptyCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: 24,
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
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 104,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.strong,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 13, 10, 0.18)',
    justifyContent: 'flex-end',
  },
  modalScrim: {
    flex: 1,
  },
  sheetSafeArea: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  sheet: {
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    ...theme.shadow.strong,
  },
  sheetKicker: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  sheetTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  sheetOptions: {
    marginTop: 14,
    gap: 10,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
  },
  captureIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: theme.colors.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    flex: 1,
  },
  captureTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  captureHint: {
    marginTop: 2,
    color: theme.colors.textSoft,
    fontSize: 13,
  },
  captureAction: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '800',
  },
  sheetClose: {
    marginTop: 14,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  sheetCloseText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  detailSheet: {
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
    ...theme.shadow.strong,
  },
  detailTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  detailBody: {
    marginTop: 10,
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  detailMetaRow: {
    marginTop: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    borderRadius: 999,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  detailMatch: {
    marginTop: 12,
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  detailActions: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 10,
  },
  detailAction: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  detailActionFilled: {
    backgroundColor: theme.colors.accent,
  },
  detailActionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  detailActionTextFilled: {
    color: '#FFF9F5',
  },
});
