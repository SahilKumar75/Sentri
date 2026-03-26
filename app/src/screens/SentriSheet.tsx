import { useMemo, useState } from 'react';
import { Modal, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Sentri</Text>
              <Text style={styles.title}>Your student copilot</Text>
            </View>
            <Pressable style={styles.doneButton} onPress={onClose}>
              <Text style={styles.doneText}>Done</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            <View style={styles.heroCard}>
              <Text style={styles.heroTitle}>Hi {userName.split(' ')[0]}, Sentri is staged for your student tasks.</Text>
              <Text style={styles.heroBody}>
                The assistant surface is ready in the navigation flow. Next we can wire it to timetable, Myspace, calorie, and hangout context.
              </Text>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Try asking later</Text>
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

            <View style={styles.composerCard}>
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
            </View>

            {reply ? (
              <View style={styles.replyCard}>
                <Text style={styles.replyLabel}>Sentri reply</Text>
                <Text style={styles.replyText}>{reply}</Text>
              </View>
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
  header: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  title: {
    marginTop: 6,
    color: theme.colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  doneButton: {
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  doneText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  content: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingBottom: 28,
    gap: 14,
  },
  heroCard: {
    backgroundColor: theme.colors.accentSoft,
    borderRadius: 24,
    padding: 18,
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
  sectionTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
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
  composerCard: {
    borderRadius: 24,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
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
