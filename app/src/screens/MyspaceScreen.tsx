import { Ionicons } from '@expo/vector-icons';
import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  Share,
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
  type CaptureOption,
  type SavedItem,
} from './myspace/data';

type MyspaceScreenProps = {
  onOpenDrawer: () => void;
  avatarLabel: string;
};

const noteTones = {
  sand: { backgroundColor: '#F6F7F8', pin: '#111111' },
  sky: { backgroundColor: '#EEF3FD', pin: '#1A73E8' },
  mint: { backgroundColor: '#F8F9FA', pin: '#5F6368' },
  rose: { backgroundColor: '#F4F5F7', pin: '#111111' },
  ink: { backgroundColor: '#E8EAED', pin: '#111111' },
} as const;

export default function MyspaceScreen({ onOpenDrawer, avatarLabel }: MyspaceScreenProps) {
  const [items, setItems] = useState<SavedItem[]>(savedItems);
  const [query, setQuery] = useState('');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [stagedCapture, setStagedCapture] = useState<CaptureOption | null>(null);

  const filteredItems = useMemo(() => searchSavedItems(items, query, 'All'), [items, query]);
  const pinnedItems = filteredItems.filter((item) => item.pinned);
  const otherItems = filteredItems.filter((item) => !item.pinned);
  const columns = splitIntoColumns(otherItems);
  const queryActive = query.trim().length > 0;
  const emptySearch = queryActive && filteredItems.length === 0;

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <AvatarButton onPress={onOpenDrawer} label={avatarLabel} />
          <View style={styles.headerCopy}>
            <Text style={styles.kicker}>Myspace</Text>
            <Text style={styles.title}>Search what you saved</Text>
            <Text style={styles.subtitle}>
              Blackboard photos, screenshots, links, files, and notes are searchable by OCR text, dates, and context.
            </Text>
          </View>
        </View>

        <View style={styles.searchCard}>
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
            {query ? (
              <Pressable onPress={() => setQuery('')} style={styles.clearButton}>
                <Ionicons name="close-circle" size={18} color={theme.colors.textMuted} />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.searchFootRow}>
            <Text style={styles.searchHint}>Search by OCR, subject, source, date, or the thing you remember first.</Text>
            <Pressable onPress={() => setAddSheetOpen(true)} style={styles.addButton}>
              <Ionicons name="add" size={16} color="#FFFFFF" />
              <Text style={styles.addButtonText}>Add</Text>
            </Pressable>
          </View>

          <View style={styles.pillRow}>
            <MetaPill label="OCR text" />
            <MetaPill label="Dates" />
            <MetaPill label="Subjects" />
          </View>
        </View>

        {stagedCapture ? (
          <View style={styles.capturePreviewCard}>
            <View style={styles.capturePreviewHeader}>
              <View style={styles.capturePreviewBadge}>
                <Ionicons name={symbolToIcon(stagedCapture.symbol)} size={16} color={theme.colors.accentStrong} />
              </View>
              <View style={styles.capturePreviewCopy}>
                <Text style={styles.capturePreviewTitle}>Ready to capture {stagedCapture.label}</Text>
                <Text style={styles.capturePreviewBody}>{stagedCapture.hint}</Text>
              </View>
            </View>
            <Text style={styles.capturePreviewMeta}>
              Sentri will index this by OCR text, source, date, and subject so you can find it later.
            </Text>
            <View style={styles.capturePreviewActions}>
              <Pressable style={styles.previewActionGhost} onPress={() => setStagedCapture(null)}>
                <Text style={styles.previewActionGhostText}>Clear</Text>
              </Pressable>
              <Pressable
                style={styles.previewActionFilled}
                onPress={() => {
                  const createdItem = buildCapturePreview(stagedCapture);
                  setItems((current) => [createdItem, ...current]);
                  setSelectedItem(createdItem);
                  setStagedCapture(null);
                }}
              >
                <Text style={styles.previewActionFilledText}>Save to Myspace</Text>
              </Pressable>
            </View>
          </View>
        ) : null}

        {!emptySearch ? (
          <>
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Pinned</Text>
                <Text style={styles.sectionMeta}>{pinnedItems.length}</Text>
              </View>

              {pinnedItems.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRow}>
                  {pinnedItems.map((item) => (
                    <PinnedCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
                  ))}
                </ScrollView>
              ) : (
                <EmptySection
                  title="No pinned items yet"
                  body="Pin your most useful notes, screenshots, and links here so they stay one tap away."
                />
              )}
            </View>

            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Others</Text>
                <Text style={styles.sectionMeta}>{otherItems.length}</Text>
              </View>

              {otherItems.length ? (
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
                <EmptySection
                  title={queryActive ? 'Nothing in Others right now' : 'Start saving to build your space'}
                  body={
                    queryActive
                      ? 'Results might already be in Pinned, or the item may only match through OCR and tags.'
                      : 'Use Add to drop in a screenshot, link, note, file, or board photo and Sentri will organize it.'
                  }
                  actionLabel="Add"
                  onAction={() => setAddSheetOpen(true)}
                />
              )}
            </View>
          </>
        ) : (
          <View style={styles.emptySearchCard}>
            <Text style={styles.emptySearchTitle}>No match for {query.trim()}</Text>
            <Text style={styles.emptySearchBody}>
              Try the subject name, a word from the board photo, the upload date, or an OCR phrase from the image.
            </Text>
            <View style={styles.emptySearchActions}>
              <Pressable style={styles.previewActionGhost} onPress={() => setQuery('')}>
                <Text style={styles.previewActionGhostText}>Clear search</Text>
              </Pressable>
              <Pressable style={styles.previewActionFilled} onPress={() => setAddSheetOpen(true)}>
                <Text style={styles.previewActionFilledText}>Add item</Text>
              </Pressable>
            </View>
          </View>
        )}
      </ScrollView>

      <Pressable
        onPress={() => setAddSheetOpen(true)}
        style={styles.fab}
        accessibilityRole="button"
        accessibilityLabel="Add to Myspace"
      >
        <Ionicons name="add" size={26} color="#FFFFFF" />
      </Pressable>

      <AddSheet
        open={addSheetOpen}
        onClose={() => setAddSheetOpen(false)}
        onSelectOption={(option) => {
          setAddSheetOpen(false);
          setStagedCapture(option);
        }}
      />

      <DetailSheet
        item={selectedItem}
        query={query}
        onClose={() => setSelectedItem(null)}
        onAction={async (action, item) => {
          if (action === 'Pin') {
            setItems((current) =>
              current.map((entry) =>
                entry.id === item.id
                  ? {
                      ...entry,
                      pinned: !entry.pinned,
                    }
                  : entry
              )
            );
            setSelectedItem((current) => (current ? { ...current, pinned: !current.pinned } : current));
            return;
          }

          await Share.share({
            title: item.title,
            message: `${item.title}\n\n${item.body}\n\nSource: ${item.source}\nSaved: ${item.dateLabel}`,
          });
          setSelectedItem(null);
        }}
      />
    </SafeAreaView>
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
      <View style={styles.cardFooter}>
        <Text style={styles.noteMeta}>{item.source}</Text>
        <Text style={styles.noteMeta}>{item.dateLabel}</Text>
      </View>
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
        <Text style={styles.noteMeta}>{item.kind}</Text>
      </View>
      <View style={styles.noteFooter}>
        <Text style={styles.noteMeta}>{item.source}</Text>
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
            <Text style={styles.sheetTitle}>What do you want to capture?</Text>
            <Text style={styles.sheetBody}>
              Choose a source type and Sentri will organize it for search later.
            </Text>
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
      <Text style={styles.captureAction}>Use</Text>
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
  onAction: (action: 'Pin' | 'Share', item: SavedItem) => void | Promise<void>;
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
            <Text style={styles.detailHint}>
              Indexed for OCR text, subject, date, and source so you can search it later from the top bar.
            </Text>
            <View style={styles.detailActions}>
              <Pressable style={styles.detailAction} onPress={() => void onAction('Pin', item)}>
                <Text style={styles.detailActionText}>{item.pinned ? 'Unpin' : 'Pin'}</Text>
              </Pressable>
              <Pressable
                style={[styles.detailAction, styles.detailActionFilled]}
                onPress={() => void onAction('Share', item)}
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

function MetaPill({ label }: { label: string }) {
  return (
    <View style={styles.metaPill}>
      <Text style={styles.metaPillText}>{label}</Text>
    </View>
  );
}

function EmptySection({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string;
  body: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.emptyCard}>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyBody}>{body}</Text>
      {actionLabel && onAction ? (
        <Pressable style={styles.emptyAction} onPress={onAction}>
          <Text style={styles.emptyActionText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
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

function buildCapturePreview(option: CaptureOption): SavedItem {
  const subjectMap: Record<string, string> = {
    image: 'Notes',
    link: 'Research',
    note: 'Personal',
    file: 'Placement',
    screenshot: 'Class',
  };

  const accentMap: Record<string, SavedItem['accent']> = {
    image: 'sand',
    link: 'sky',
    note: 'mint',
    file: 'rose',
    screenshot: 'ink',
  };

  return {
    id: `draft-${option.id}`,
    title: `${option.label} capture preview`,
    body: `This ${option.label.toLowerCase()} will be indexed by OCR text, source, date, and subject.`,
    kind: option.id as SavedItem['kind'],
    subject: subjectMap[option.id] ?? 'Personal',
    tags: [option.id, 'capture', 'indexed'],
    source: option.hint,
    dateLabel: 'Now',
    accent: accentMap[option.id] ?? 'sand',
    pinned: false,
    featured: true,
    ocrText: `${option.label} capture preview for search and retrieval.`,
  };
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
    alignItems: 'flex-start',
    gap: 12,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
  },
  kicker: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    color: theme.colors.text,
    fontSize: 31,
    fontWeight: '800',
    lineHeight: 36,
  },
  subtitle: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
    maxWidth: 320,
  },
  searchCard: {
    marginTop: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 16,
    ...theme.shadow.soft,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    color: theme.colors.text,
    fontSize: 15,
  },
  clearButton: {
    paddingLeft: 4,
  },
  searchFootRow: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchHint: {
    flex: 1,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  pillRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaPill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  metaPillText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  capturePreviewCard: {
    marginTop: 16,
    borderRadius: 24,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.20)',
    padding: 16,
  },
  capturePreviewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  capturePreviewBadge: {
    width: 42,
    height: 42,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  capturePreviewCopy: {
    flex: 1,
  },
  capturePreviewTitle: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  capturePreviewBody: {
    marginTop: 4,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  capturePreviewMeta: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 13,
    lineHeight: 20,
  },
  capturePreviewActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  previewActionGhost: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewActionGhostText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  previewActionFilled: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    paddingVertical: 12,
    alignItems: 'center',
  },
  previewActionFilledText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  section: {
    marginTop: 18,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 22,
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
  cardFooter: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  emptyAction: {
    marginTop: 14,
    alignSelf: 'flex-start',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  emptySearchCard: {
    marginTop: 18,
    backgroundColor: theme.colors.surface,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
  },
  emptySearchTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  emptySearchBody: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  emptySearchActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
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
  },
  sheetKicker: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  sheetTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 21,
    fontWeight: '800',
  },
  sheetBody: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  sheetOptions: {
    marginTop: 14,
    gap: 10,
  },
  captureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    padding: 14,
  },
  captureIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureText: {
    flex: 1,
  },
  captureTitle: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '800',
  },
  captureHint: {
    marginTop: 4,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 18,
  },
  captureAction: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '800',
  },
  sheetClose: {
    marginTop: 14,
    alignSelf: 'flex-end',
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sheetCloseText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  detailSheet: {
    borderRadius: 28,
    backgroundColor: theme.colors.surface,
    padding: 18,
    borderWidth: 1,
    borderColor: theme.colors.line,
  },
  detailTitle: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  detailBody: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  detailMetaRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  metaChip: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  metaChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  detailMatch: {
    marginTop: 12,
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '700',
  },
  detailHint: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 13,
    lineHeight: 19,
  },
  detailActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  detailAction: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailActionFilled: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  detailActionText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  detailActionTextFilled: {
    color: '#FFFFFF',
  },
});
