import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../design/tokens';
import type { ContactMethod, PendingSignup, UserProfile } from '../types/auth';

type AuthMode = 'signup' | 'login' | 'otp';

type AuthScreenProps = {
  mode: AuthMode;
  registeredUser: UserProfile | null;
  pendingSignup: PendingSignup | null;
  statusMessage?: string | null;
  onModeChange: (mode: Exclude<AuthMode, 'otp'>) => void;
  onSignup: (payload: { profile: UserProfile; contactMethod: ContactMethod }) => { ok: boolean; message: string };
  onVerifyOtp: (otp: string) => { ok: boolean; message: string };
  onLogin: (payload: { identifier: string; password: string }) => { ok: boolean; message: string };
};

export default function AuthScreen({
  mode,
  registeredUser,
  pendingSignup,
  statusMessage,
  onModeChange,
  onSignup,
  onVerifyOtp,
  onLogin,
}: AuthScreenProps) {
  const [contactMethod, setContactMethod] = useState<ContactMethod>('phone');
  const [signupForm, setSignupForm] = useState<UserProfile>({
    firstName: '',
    lastName: '',
    dob: '',
    phone: '',
    email: '',
    password: '',
    verifiedPhone: false,
  });
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  const activeMessage = localMessage ?? statusMessage;
  const helperLabel = useMemo(() => {
    if (!registeredUser) {
      return 'Create your Sentri account to unlock timetable, Myspace, calorie, and hangout.';
    }

    return `Existing account found for ${registeredUser.firstName} ${registeredUser.lastName}.`;
  }, [registeredUser]);

  const updateSignupField = (key: keyof UserProfile, value: string) => {
    setSignupForm((current) => ({ ...current, [key]: value }));
  };

  useEffect(() => {
    setLocalMessage(null);
    setOtpInput('');
  }, [mode, pendingSignup?.otpCode]);

  const changeMode = (nextMode: Exclude<AuthMode, 'otp'>) => {
    setLocalMessage(null);
    onModeChange(nextMode);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.eyebrow}>Sentri</Text>
      <Text style={styles.title}>Secure your student space.</Text>
      <Text style={styles.subtitle}>{helperLabel}</Text>

      {activeMessage ? (
        <View style={styles.statusBanner}>
          <Text style={styles.statusText}>{activeMessage}</Text>
        </View>
      ) : null}

      {mode !== 'otp' ? (
        <View style={styles.modeSwitch}>
          <ModeButton label="Sign up" active={mode === 'signup'} onPress={() => changeMode('signup')} />
          <ModeButton label="Login" active={mode === 'login'} onPress={() => changeMode('login')} />
        </View>
      ) : null}

      {mode === 'signup' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Create account</Text>

          <View style={styles.row}>
            <Field
              label="First name"
              value={signupForm.firstName}
              onChangeText={(value) => updateSignupField('firstName', value)}
              placeholder="Sahil"
            />
            <Field
              label="Last name"
              value={signupForm.lastName}
              onChangeText={(value) => updateSignupField('lastName', value)}
              placeholder="Kumar"
            />
          </View>

          <Field
            label="Date of birth"
            value={signupForm.dob}
            onChangeText={(value) => updateSignupField('dob', value)}
            placeholder="DD/MM/YYYY"
          />

          <View style={styles.inlineChooser}>
            <ChooserChip
              label="Phone + OTP"
              active={contactMethod === 'phone'}
              onPress={() => {
                setLocalMessage(null);
                setContactMethod('phone');
              }}
            />
            <ChooserChip
              label="Email"
              active={contactMethod === 'email'}
              onPress={() => {
                setLocalMessage(null);
                setContactMethod('email');
              }}
            />
          </View>

          {contactMethod === 'phone' ? (
            <Field
              label="Phone number"
              value={signupForm.phone ?? ''}
              onChangeText={(value) => updateSignupField('phone', value)}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
            />
          ) : (
            <Field
              label="Email"
              value={signupForm.email ?? ''}
              onChangeText={(value) => updateSignupField('email', value)}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          )}

          <Field
            label="Password"
            value={signupForm.password}
            onChangeText={(value) => updateSignupField('password', value)}
            placeholder="Choose a password"
            secureTextEntry
          />

          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              const result = onSignup({ profile: signupForm, contactMethod });
              setLocalMessage(result.message);
            }}
          >
            <Text style={styles.primaryButtonText}>
              {contactMethod === 'phone' ? 'Send OTP' : 'Create account'}
            </Text>
          </Pressable>
        </View>
      ) : null}

      {mode === 'login' ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Login</Text>
          <Field
            label="Phone or email"
            value={loginIdentifier}
            onChangeText={setLoginIdentifier}
            placeholder="+91 98765 43210 or you@example.com"
            autoCapitalize="none"
          />
          <Field
            label="Password"
            value={loginPassword}
            onChangeText={setLoginPassword}
            placeholder="Enter password"
            secureTextEntry
          />
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              const result = onLogin({ identifier: loginIdentifier, password: loginPassword });
              setLocalMessage(result.message);
            }}
          >
            <Text style={styles.primaryButtonText}>Login</Text>
          </Pressable>
        </View>
      ) : null}

      {mode === 'otp' && pendingSignup ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Verify phone number</Text>
          <Text style={styles.supportText}>
            Sentri sent an OTP to {pendingSignup.profile.phone}. Enter it below to finish account creation.
          </Text>
          <Text style={styles.demoText}>Demo OTP for now: {pendingSignup.otpCode}</Text>
          <Field
            label="OTP"
            value={otpInput}
            onChangeText={setOtpInput}
            placeholder="Enter 4-digit OTP"
            keyboardType="number-pad"
          />
          <Pressable
            style={styles.primaryButton}
            onPress={() => {
              const result = onVerifyOtp(otpInput);
              setLocalMessage(result.message);
            }}
          >
            <Text style={styles.primaryButtonText}>Verify and continue</Text>
          </Pressable>
          <Pressable style={styles.secondaryButton} onPress={() => changeMode('signup')}>
            <Text style={styles.secondaryButtonText}>Back to sign up</Text>
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType,
  autoCapitalize = 'words',
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'phone-pad' | 'number-pad';
  autoCapitalize?: 'none' | 'words' | 'sentences' | 'characters';
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        style={styles.fieldInput}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
      />
    </View>
  );
}

function ModeButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </Pressable>
  );
}

function ChooserChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={[styles.chooserChip, active && styles.chooserChipActive]}>
      <Text style={[styles.chooserChipText, active && styles.chooserChipTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    paddingHorizontal: theme.chrome.horizontalPadding,
    paddingTop: 48,
    paddingBottom: 48,
  },
  eyebrow: {
    color: theme.colors.accentStrong,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    marginTop: 10,
    color: theme.colors.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  subtitle: {
    marginTop: 8,
    color: theme.colors.textSoft,
    fontSize: 15,
    lineHeight: 22,
  },
  statusBanner: {
    marginTop: 16,
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  statusText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  modeSwitch: {
    marginTop: 22,
    flexDirection: 'row',
    backgroundColor: theme.colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 4,
  },
  modeButton: {
    flex: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  modeButtonActive: {
    backgroundColor: theme.colors.surfaceStrong,
  },
  modeButtonText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    fontWeight: '700',
  },
  modeButtonTextActive: {
    color: theme.colors.surface,
  },
  card: {
    marginTop: 20,
    backgroundColor: theme.colors.surface,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.colors.line,
    padding: 18,
    gap: 14,
    ...theme.shadow.soft,
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 22,
    fontWeight: '800',
  },
  supportText: {
    color: theme.colors.textSoft,
    fontSize: 14,
    lineHeight: 20,
  },
  demoText: {
    color: theme.colors.accentStrong,
    fontSize: 13,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  field: {
    flex: 1,
    gap: 8,
  },
  fieldLabel: {
    color: theme.colors.textSoft,
    fontSize: 13,
    fontWeight: '700',
  },
  fieldInput: {
    borderRadius: 18,
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.line,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: theme.colors.text,
    fontSize: 15,
  },
  inlineChooser: {
    flexDirection: 'row',
    gap: 10,
  },
  chooserChip: {
    flex: 1,
    borderRadius: 16,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  chooserChipActive: {
    backgroundColor: theme.colors.accent,
  },
  chooserChipText: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  chooserChipTextActive: {
    color: '#FFF9F5',
  },
  primaryButton: {
    borderRadius: 18,
    backgroundColor: theme.colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  primaryButtonText: {
    color: '#FFF9F5',
    fontSize: 15,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 18,
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButtonText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
