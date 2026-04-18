import { Ionicons } from '@expo/vector-icons';
import { useDeferredValue, useEffect, useMemo, useState } from 'react';
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
import { AvatarButton, SectionHeader } from '../components/sentri-ui';
import { theme } from '../design/tokens';
import { buildCapturedItem, buildCapturePreview, createEmptyCaptureDraft, type CaptureDraft } from '../features/myspace/capture-builder';
import type { CaptureOption, SavedItem } from '../features/myspace/models';
import { buildSearchSuggestions, normalizeSearchQuery, pushRecentSearch } from '../features/myspace/search-history';
import { explainMatch, rankMyspaceItems, type RetrievalMatch } from '../features/myspace/retrieval-engine';
import { PERSISTENT_KEYS } from '../lib/persistent-keys';
import { usePersistedState } from '../lib/use-persisted-state';
import {
  captureOptions,
  savedItems,
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
  const { value: items, setValue: setItems } = usePersistedState<SavedItem[]>(
    PERSISTENT_KEYS.myspaceItems,
    savedItems
  );
  const { value: recentSearches, setValue: setRecentSearches } = usePersistedState<string[]>(
    PERSISTENT_KEYS.myspaceRecentSearches,
    []
  );
  const [query, setQuery] = useState('');
  const [addSheetOpen, setAddSheetOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<SavedItem | null>(null);
  const [stagedCapture, setStagedCapture] = useState<CaptureOption | null>(null);
  const [captureDraft, setCaptureDraft] = useState<CaptureDraft | null>(null);
  const deferredQuery = useDeferredValue(query);
  const normalizedQuery = query.trim();
  const searching = normalizedQuery.length > 0 && deferredQuery.trim() !== normalizedQuery;

  const rankedMatches = useMemo(() => rankMyspaceItems(items, deferredQuery, 'All'), [deferredQuery, items]);
  const filteredItems = rankedMatches.map((match) => match.item);
  const matchMap = useMemo(
    () => new Map(rankedMatches.map((match) => [match.item.id, match] as const)),
    [rankedMatches]
  );
  const pinnedItems = filteredItems.filter((item) => item.pinned);
  const recentTodayItems = filteredItems.filter((item) => ['Now', 'Today'].includes(item.dateLabel) && !item.pinned);
  const otherItems = filteredItems.filter((item) => !item.pinned);
  const columns = splitIntoColumns(otherItems);
  const queryActive = normalizedQuery.length > 0;
  const emptySearch = queryActive && filteredItems.length === 0;
  const suggestions = useMemo(() => buildSearchSuggestions(recentSearches, items), [items, recentSearches]);

  useEffect(() => {
    const normalized = normalizeSearchQuery(query);
    if (!normalized) {
      return;
    }

    const timeout = setTimeout(() => {
      setRecentSearches((current) => pushRecentSearch(current, normalized));
    }, 500);

    return () => clearTimeout(timeout);
  }, [query, setRecentSearches]);

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

        {searching ? (
          <View style={styles.searchStateCard}>
            <Ionicons name="time-outline" size={16} color={theme.colors.accentStrong} />
            <Text style={styles.searchStateText}>Searching OCR, titles, dates, and subject memory…</Text>
          </View>
        ) : queryActive ? (
          <View style={styles.searchStateCard}>
            <Ionicons name="sparkles-outline" size={16} color={theme.colors.accentStrong} />
            <Text style={styles.searchStateText}>
              {filteredItems.length} result{filteredItems.length === 1 ? '' : 's'} for "{normalizedQuery}"
            </Text>
          </View>
        ) : null}

        {!queryActive && suggestions.length ? (
          <View style={styles.suggestionRow}>
            {suggestions.map((suggestion) => (
              <Pressable key={suggestion} style={styles.suggestionChip} onPress={() => setQuery(suggestion)}>
                <Ionicons name="sparkles-outline" size={13} color={theme.colors.accentStrong} />
                <Text style={styles.suggestionChipText}>{suggestion}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}

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
            {captureDraft ? (
              <View style={styles.capturePreviewChips}>
                <MetaChip label={captureDraft.subject || 'Subject'} />
                <MetaChip label={captureDraft.source || 'Source'} />
                {(captureDraft.tags || '')
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((tag) => (
                    <MetaChip key={tag} label={tag} />
                  ))}
              </View>
            ) : null}
            <View style={styles.capturePreviewActions}>
              <Pressable style={styles.previewActionGhost} onPress={() => setStagedCapture(null)}>
                <Text style={styles.previewActionGhostText}>Clear</Text>
              </Pressable>
              <Pressable
                style={styles.previewActionFilled}
                onPress={() => {
                  const createdItem = captureDraft
                    ? buildCapturedItem(stagedCapture, captureDraft)
                    : buildCapturePreview(stagedCapture);
                  setItems((current) => [createdItem, ...current]);
                  setSelectedItem(createdItem);
                  setStagedCapture(null);
                  setCaptureDraft(null);
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
              <SectionHeader title="Pinned" meta={`${pinnedItems.length}`} />

              {pinnedItems.length ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRow}>
                  {pinnedItems.map((item) => (
                    <PinnedCard key={item.id} item={item} onPress={() => setSelectedItem(item)} />
                  ))}
                </ScrollView>
              ) : (
                <EmptySection
                  title={queryActive ? 'No pinned match yet' : 'No pinned items yet'}
                  body={
                    queryActive
                      ? 'This query matched other saved items, but nothing pinned for now.'
                      : 'Pin your most useful notes, screenshots, and links here so they stay one tap away.'
                  }
                />
              )}
            </View>

            {recentTodayItems.length ? (
              <View style={styles.section}>
                <SectionHeader title="New today" meta={`${recentTodayItems.length}`} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pinnedRow}>
                  {recentTodayItems.map((item) => (
                    <PinnedCard key={`today-${item.id}`} item={item} onPress={() => setSelectedItem(item)} />
                  ))}
                </ScrollView>
              </View>
            ) : null}

            <View style={styles.section}>
              <SectionHeader title="Others" meta={`${otherItems.length}`} />

              {otherItems.length ? (
                <View style={styles.masonry}>
                  <View style={styles.column}>
                    {columns[0].map((item) => (
                      <NoteCard
                        key={item.id}
                        item={item}
                        query={query}
                        match={matchMap.get(item.id) ?? null}
                        onPress={() => setSelectedItem(item)}
                      />
                    ))}
                  </View>
                  <View style={styles.column}>
                    {columns[1].map((item) => (
                      <NoteCard
                        key={item.id}
                        item={item}
                        query={query}
                        match={matchMap.get(item.id) ?? null}
                        onPress={() => setSelectedItem(item)}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <EmptySection
                  title={queryActive ? 'No other results for this search' : 'Start saving to build your space'}
                  body={
                    queryActive
                      ? pinnedItems.length
                        ? 'Pinned still has matches. Try another keyword, OCR phrase, upload date, or source.'
                        : 'Try the subject name, a board keyword, a date label, or an OCR phrase from the image.'
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
          setCaptureDraft(createEmptyCaptureDraft(option));
          setComposerOpen(true);
        }}
      />

      <CaptureComposerSheet
        open={composerOpen}
        option={stagedCapture}
        draft={captureDraft}
        onClose={() => setComposerOpen(false)}
        onChangeDraft={(nextDraft) => setCaptureDraft(nextDraft)}
        onContinue={() => {
          setComposerOpen(false);
          if (!stagedCapture) {
            return;
          }
          if (!captureDraft) {
            setCaptureDraft(createEmptyCaptureDraft(stagedCapture));
          }
          setStagedCapture(stagedCapture);
        }}
      />

      <DetailSheet
        item={selectedItem}
        query={query}
        match={selectedItem ? matchMap.get(selectedItem.id) ?? null : null}
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

          if (action === 'Delete') {
            setItems((current) => current.filter((entry) => entry.id !== item.id));
            setSelectedItem(null);
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
  match,
  onPress,
}: {
  item: SavedItem;
  query: string;
  match: RetrievalMatch | null;
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
      <Text style={styles.matchText}>{explainMatch(match, item, query)}</Text>
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

function CaptureComposerSheet({
  open,
  option,
  draft,
  onClose,
  onChangeDraft,
  onContinue,
}: {
  open: boolean;
  option: CaptureOption | null;
  draft: CaptureDraft | null;
  onClose: () => void;
  onChangeDraft: (draft: CaptureDraft) => void;
  onContinue: () => void;
}) {
  if (!option || !draft) {
    return null;
  }

  return (
    <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalBackdrop}>
        <Pressable style={styles.modalScrim} onPress={onClose} />
        <SafeAreaView style={styles.sheetSafeArea}>
          <View style={styles.detailSheet}>
            <Text style={styles.sheetKicker}>{option.label}</Text>
            <Text style={styles.sheetTitle}>Compose this capture</Text>
            <Text style={styles.sheetBody}>
              Give it a title and a short memory note first. You can review the indexed preview next.
            </Text>
            <TextInput
              value={draft.title}
              onChangeText={(value) => onChangeDraft({ ...draft, title: value })}
              placeholder="Title"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.composerField}
            />
            <TextInput
              value={draft.body}
              onChangeText={(value) => onChangeDraft({ ...draft, body: value })}
              placeholder="What should future-you remember?"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.composerField, styles.composerFieldLarge]}
              multiline
            />
            <TextInput
              value={draft.subject}
              onChangeText={(value) => onChangeDraft({ ...draft, subject: value })}
              placeholder="Subject or bucket"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.composerField}
            />
            <TextInput
              value={draft.source}
              onChangeText={(value) => onChangeDraft({ ...draft, source: value })}
              placeholder="Source"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.composerField}
            />
            <TextInput
              value={draft.tags}
              onChangeText={(value) => onChangeDraft({ ...draft, tags: value })}
              placeholder="Tags, comma separated"
              placeholderTextColor={theme.colors.textMuted}
              style={styles.composerField}
            />
            <TextInput
              value={draft.ocrText}
              onChangeText={(value) => onChangeDraft({ ...draft, ocrText: value })}
              placeholder="OCR text or remembered phrase"
              placeholderTextColor={theme.colors.textMuted}
              style={[styles.composerField, styles.composerFieldLarge]}
              multiline
            />
            <View style={styles.detailActions}>
              <Pressable style={styles.detailAction} onPress={onClose}>
                <Text style={styles.detailActionText}>Cancel</Text>
              </Pressable>
              <Pressable style={[styles.detailAction, styles.detailActionFilled]} onPress={onContinue}>
                <Text style={[styles.detailActionText, styles.detailActionTextFilled]}>Continue</Text>
              </Pressable>
            </View>
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
  match,
  onClose,
  onAction,
}: {
  item: SavedItem | null;
  query: string;
  match: RetrievalMatch | null;
  onClose: () => void;
  onAction: (action: 'Pin' | 'Share' | 'Delete', item: SavedItem) => void | Promise<void>;
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
            <Text style={styles.detailMatch}>{explainMatch(match, item, query)}</Text>
            <Text style={styles.detailHint}>
              Indexed for OCR text, subject, date, and source so you can search it later from the top bar.
            </Text>
            <View style={styles.detailActions}>
              <Pressable style={styles.detailAction} onPress={() => void onAction('Pin', item)}>
                <Text style={styles.detailActionText}>{item.pinned ? 'Unpin' : 'Pin'}</Text>
              </Pressable>
              <Pressable style={styles.detailAction} onPress={() => void onAction('Delete', item)}>
                <Text style={styles.detailActionText}>Delete</Text>
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
  searchStateCard: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 18,
    backgroundColor: theme.colors.accentSoft,
    borderWidth: 1,
    borderColor: 'rgba(26, 115, 232, 0.12)',
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  searchStateText: {
    flex: 1,
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
  },
  suggestionRow: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  suggestionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  suggestionChipText: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
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
  capturePreviewChips: {
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
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
  composerField: {
    marginTop: 12,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 14,
  },
  composerFieldLarge: {
    minHeight: 110,
    textAlignVertical: 'top',
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
