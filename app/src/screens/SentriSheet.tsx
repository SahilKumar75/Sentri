import { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SectionHeader, SheetHeader, SurfaceCard } from '../components/sentri-ui';
import { theme } from '../design/tokens';

type SentriSheetProps = {
  visible: boolean;
  userName: string;
  onClose: () => void;
};

const starterPrompts = [
  'What is my next class?',
  'Remind me to upload the new timetable on Saturday.',
  'Find my DBMS blackboard notes from last week.',
  'How many calories do I have left today?',
];

export default function SentriSheet({ visible, userName, onClose }: SentriSheetProps) {
  const [draft, setDraft] = useState('');
  const [lastPrompt, setLastPrompt] = useState<string | null>(null);

  const reply = useMemo(() => {
    const normalized = (lastPrompt ?? draft).trim().toLowerCase();
    if (!normalized) {
      return null;
    }
    if (normalized.includes('next class')) {
      return 'Your next class card on Home is the fastest place to check. We can wire this assistant to read that live timetable state next.';
    }
    if (normalized.includes('timetable')) {
      return 'Use the Upload action on Home every Saturday when the new timetable screenshot lands. The parser hook is the next backend step.';
    }
    if (normalized.includes('dbms') || normalized.includes('notes')) {
      return 'Myspace is set up for this flow now. Search DBMS, blackboard, date, or OCR phrases to find saved board photos and notes.';
    }
    if (normalized.includes('calories') || normalized.includes('left')) {
      return 'Calorie already computes remaining intake after meals and manual burn. Open Calorie to check your today target and remaining kcal.';
    }
    return 'Sentri is now part of the app flow. The next step is wiring it to live timetable, Myspace, calorie, and hangout context.';
  }, [draft, lastPrompt]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={styles.scrim} onPress={onClose} />
        <SafeAreaView style={styles.sheet}>
          <SheetHeader eyebrow="Sentri" title="Your student copilot" onActionPress={onClose} />

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <SurfaceCard tone="accent">
              <Text style={styles.heroTitle}>Hi {userName.split(' ')[0]}, Sentri is staged for your student tasks.</Text>
              <Text style={styles.heroBody}>
                The assistant surface is ready in the navigation flow. Next we can wire it to timetable, Myspace, calorie, and hangout context.
              </Text>
            </SurfaceCard>

            <View style={styles.section}>
              <SectionHeader title="Try asking later" />
              {starterPrompts.map((prompt) => (
                <Pressable
                  key={prompt}
                  style={styles.promptCard}
                  onPress={() => {
                    setDraft(prompt);
                    setLastPrompt(prompt);
                  }}
                >
                  <Text style={styles.promptText}>{prompt}</Text>
                </Pressable>
              ))}
            </View>

            <SurfaceCard>
              <Text style={styles.composerLabel}>Assistant input</Text>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Ask a student task question"
                placeholderTextColor={theme.colors.textMuted}
                style={styles.input}
              />
              <View style={styles.composerActions}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => {
                    setDraft('');
                    setLastPrompt(null);
                  }}
                >
                  <Text style={styles.secondaryButtonText}>Clear</Text>
                </Pressable>
                <Pressable
                  style={styles.primaryButton}
                  onPress={() => {
                    setLastPrompt(draft.trim());
                  }}
                >
                  <Text style={styles.primaryButtonText}>Ask Sentri</Text>
                </Pressable>
              </View>
              <View style={styles.helperRow}>
                <Text style={styles.helperText}>Voice and context-aware answers can plug in here next.</Text>
              </View>
            </SurfaceCard>

            {reply ? (
              <SurfaceCard radius="md">
                <Text style={styles.replyLabel}>Sentri reply</Text>
                <Text style={styles.replyText}>{reply}</Text>
              </SurfaceCard>
            ) : null}
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 17, 17, 0.24)',
  },
  scrim: {
    flex: 1,
  },
  sheet: {
    minHeight: '58%',
    maxHeight: '84%',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: theme.colors.background,
    paddingTop: 10,
  },
  content: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingBottom: 28,
    gap: 14,
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
    lineHeight: 21,
  },
  section: {
    gap: 10,
  },
  promptCard: {
    borderRadius: 18,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  promptText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  composerLabel: {
    color: theme.colors.textSoft,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
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
  helperRow: {
    marginTop: 12,
  },
  composerActions: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  helperText: {
    color: theme.colors.textMuted,
    fontSize: 13,
    lineHeight: 19,
  },
  replyCard: {
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
  },
  replyLabel: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  replyText: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 15,
    lineHeight: 22,
  },
});
