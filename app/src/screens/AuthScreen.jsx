import { useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, Modal, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View, } from 'react-native';
import { theme } from '../design/tokens';
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export default function AuthScreen({ mode, pendingSignup, statusMessage, onModeChange, onSignup, onVerifyOtp, onLogin, }) {
    const [contactMethod, setContactMethod] = useState('phone');
    const [signupForm, setSignupForm] = useState({
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
    const [localMessage, setLocalMessage] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [dobPickerOpen, setDobPickerOpen] = useState(false);
    const [pickerDay, setPickerDay] = useState(23);
    const [pickerMonth, setPickerMonth] = useState(2);
    const [pickerYear, setPickerYear] = useState(2005);
    const activeMessage = localMessage ?? statusMessage;
    const helperLabel = useMemo(() => 'Create your Sentri account to unlock timetable, Myspace, calorie, and hangout.', []);
    const selectedDobLabel = `${String(pickerDay).padStart(2, '0')} ${monthNames[pickerMonth]} ${pickerYear}`;
    useEffect(() => {
        setLocalMessage(null);
        setOtpInput('');
    }, [mode, pendingSignup?.otpCode]);
    const updateSignupField = (key, value) => {
        setSignupForm((current) => ({ ...current, [key]: value }));
    };
    const changeMode = (nextMode) => {
        setLocalMessage(null);
        onModeChange(nextMode);
    };
    const openDobPicker = () => {
        const parsed = parseDob(signupForm.dob);
        setPickerDay(parsed?.day ?? 23);
        setPickerMonth(parsed?.month ?? 2);
        setPickerYear(parsed?.year ?? 2005);
        setDobPickerOpen(true);
    };
    return (<KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={Platform.OS === 'ios' ? 24 : 0}>
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>Sentri</Text>
        <Text style={styles.title}>Secure your student space.</Text>
        <Text style={styles.subtitle}>{helperLabel}</Text>

        {activeMessage ? (<View style={styles.statusBanner}>
            <Text style={styles.statusText}>{activeMessage}</Text>
          </View>) : null}

        {mode !== 'otp' ? (<View style={styles.modeSwitch}>
            <ModeButton label="Sign up" active={mode === 'signup'} onPress={() => changeMode('signup')}/>
            <ModeButton label="Login" active={mode === 'login'} onPress={() => changeMode('login')}/>
          </View>) : null}

        {mode === 'signup' ? (<View style={styles.card}>
            <Text style={styles.cardTitle}>Create account</Text>

            <View style={styles.row}>
              <Field label="First name" value={signupForm.firstName} onChangeText={(value) => updateSignupField('firstName', value)} placeholder="Sahil"/>
              <Field label="Last name" value={signupForm.lastName} onChangeText={(value) => updateSignupField('lastName', value)} placeholder="Kumar"/>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>Date of birth</Text>
              <Pressable style={styles.dateField} onPress={openDobPicker}>
                <Text style={[styles.dateFieldText, !signupForm.dob && styles.dateFieldPlaceholder]}>
                  {signupForm.dob || 'Pick your date of birth'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.inlineChooser}>
              <ChooserChip label="Phone + OTP" active={contactMethod === 'phone'} onPress={() => {
                setLocalMessage(null);
                setContactMethod('phone');
            }}/>
              <ChooserChip label="Email" active={contactMethod === 'email'} onPress={() => {
                setLocalMessage(null);
                setContactMethod('email');
            }}/>
            </View>

            {contactMethod === 'phone' ? (<Field label="Phone number" value={signupForm.phone ?? ''} onChangeText={(value) => updateSignupField('phone', value)} placeholder="+91 98765 43210" keyboardType="phone-pad" autoCapitalize="none"/>) : (<Field label="Email" value={signupForm.email ?? ''} onChangeText={(value) => updateSignupField('email', value)} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none"/>)}

            <Field label="Password" value={signupForm.password ?? ''} onChangeText={(value) => updateSignupField('password', value)} placeholder="Choose a password" secureTextEntry autoCapitalize="none"/>

            <Pressable style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]} disabled={submitting} onPress={async () => {
                setSubmitting(true);
                const result = await onSignup({ profile: signupForm, contactMethod });
                setSubmitting(false);
                setLocalMessage(result.message);
            }}>
              <Text style={styles.primaryButtonText}>
                {submitting ? 'Please wait' : contactMethod === 'phone' ? 'Send OTP' : 'Create account'}
              </Text>
            </Pressable>
          </View>) : null}

        {mode === 'login' ? (<View style={styles.card}>
            <Text style={styles.cardTitle}>Login</Text>
            <Field label="Phone or email" value={loginIdentifier} onChangeText={setLoginIdentifier} placeholder="+91 98765 43210 or you@example.com" autoCapitalize="none"/>
            <Field label="Password" value={loginPassword} onChangeText={setLoginPassword} placeholder="Enter password" secureTextEntry autoCapitalize="none"/>
            <Pressable style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]} disabled={submitting} onPress={async () => {
                setSubmitting(true);
                const result = await onLogin({ identifier: loginIdentifier, password: loginPassword });
                setSubmitting(false);
                setLocalMessage(result.message);
            }}>
              <Text style={styles.primaryButtonText}>{submitting ? 'Please wait' : 'Login'}</Text>
            </Pressable>
          </View>) : null}

        {mode === 'otp' && pendingSignup ? (<View style={styles.card}>
            <Text style={styles.cardTitle}>Verify phone number</Text>
            <Text style={styles.supportText}>
              Sentri sent an OTP to {pendingSignup.phone}. Enter it below to finish account creation.
            </Text>
            <Text style={styles.demoText}>Demo OTP for now: {pendingSignup.otpCode}</Text>
            <Field label="OTP" value={otpInput} onChangeText={setOtpInput} placeholder="Enter 4-digit OTP" keyboardType="number-pad" autoCapitalize="none"/>
            <Pressable style={[styles.primaryButton, submitting && styles.primaryButtonDisabled]} disabled={submitting} onPress={async () => {
                setSubmitting(true);
                const result = await onVerifyOtp(otpInput);
                setSubmitting(false);
                setLocalMessage(result.message);
            }}>
              <Text style={styles.primaryButtonText}>{submitting ? 'Please wait' : 'Verify and continue'}</Text>
            </Pressable>
            <Pressable style={styles.secondaryButton} onPress={() => changeMode('signup')}>
              <Text style={styles.secondaryButtonText}>Back to sign up</Text>
            </Pressable>
          </View>) : null}
      </ScrollView>

      <Modal visible={dobPickerOpen} transparent animationType="slide" onRequestClose={() => setDobPickerOpen(false)}>
        <View style={styles.modalBackdrop}>
          <Pressable style={styles.modalScrim} onPress={() => setDobPickerOpen(false)}/>
          <SafeAreaView style={styles.sheetSafeArea}>
            <View style={styles.sheet}>
              <Text style={styles.sheetKicker}>Date of birth</Text>
              <Text style={styles.sheetTitle}>{selectedDobLabel}</Text>

              <Text style={styles.sheetSection}>Month</Text>
              <View style={styles.monthGrid}>
                {monthNames.map((label, index) => (<Pressable key={label} onPress={() => {
                setPickerMonth(index);
                setPickerDay((current) => Math.min(current, daysInMonth(pickerYear, index)));
            }} style={[styles.monthChip, pickerMonth === index && styles.monthChipActive]}>
                    <Text style={[styles.monthChipText, pickerMonth === index && styles.monthChipTextActive]}>
                      {label}
                    </Text>
                  </Pressable>))}
              </View>

              <View style={styles.pickerRow}>
                <Stepper label="Day" value={String(pickerDay).padStart(2, '0')} onMinus={() => setPickerDay((current) => Math.max(1, current - 1))} onPlus={() => setPickerDay((current) => Math.min(daysInMonth(pickerYear, pickerMonth), current + 1))}/>
                <Stepper label="Year" value={`${pickerYear}`} onMinus={() => setPickerYear((current) => {
            const next = Math.max(1990, current - 1);
            setPickerDay((day) => Math.min(day, daysInMonth(next, pickerMonth)));
            return next;
        })} onPlus={() => setPickerYear((current) => {
            const next = Math.min(new Date().getFullYear(), current + 1);
            setPickerDay((day) => Math.min(day, daysInMonth(next, pickerMonth)));
            return next;
        })}/>
              </View>

              <View style={styles.sheetActions}>
                <Pressable style={styles.sheetButtonMuted} onPress={() => setDobPickerOpen(false)}>
                  <Text style={styles.sheetButtonMutedText}>Cancel</Text>
                </Pressable>
                <Pressable style={styles.sheetButtonFilled} onPress={() => {
            const safeDay = Math.min(pickerDay, daysInMonth(pickerYear, pickerMonth));
            updateSignupField('dob', `${String(safeDay).padStart(2, '0')}/${String(pickerMonth + 1).padStart(2, '0')}/${pickerYear}`);
            setDobPickerOpen(false);
        }}>
                  <Text style={styles.sheetButtonFilledText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </KeyboardAvoidingView>);
}
function parseDob(dob) {
    const match = dob.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!match)
        return null;
    const day = Number(match[1]);
    const month = Number(match[2]) - 1;
    const year = Number(match[3]);
    if (month < 0 || month > 11)
        return null;
    return {
        day: Math.min(Math.max(day, 1), daysInMonth(year, month)),
        month,
        year,
    };
}
function daysInMonth(year, monthIndex) {
    return new Date(year, monthIndex + 1, 0).getDate();
}
function Field({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, autoCapitalize = 'words', }) {
    return (<View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={theme.colors.textMuted} style={styles.fieldInput} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={autoCapitalize}/>
    </View>);
}
function ModeButton({ label, active, onPress }) {
    return (<Pressable onPress={onPress} style={[styles.modeButton, active && styles.modeButtonActive]}>
      <Text style={[styles.modeButtonText, active && styles.modeButtonTextActive]}>{label}</Text>
    </Pressable>);
}
function ChooserChip({ label, active, onPress }) {
    return (<Pressable onPress={onPress} style={[styles.chooserChip, active && styles.chooserChipActive]}>
      <Text style={[styles.chooserChipText, active && styles.chooserChipTextActive]}>{label}</Text>
    </Pressable>);
}
function Stepper({ label, value, onMinus, onPlus, }) {
    return (<View style={styles.stepperCard}>
      <Text style={styles.stepperLabel}>{label}</Text>
      <Text style={styles.stepperValue}>{value}</Text>
      <View style={styles.stepperButtons}>
        <Pressable style={styles.stepperButton} onPress={onMinus}>
          <Text style={styles.stepperButtonText}>-</Text>
        </Pressable>
        <Pressable style={styles.stepperButton} onPress={onPlus}>
          <Text style={styles.stepperButtonText}>+</Text>
        </Pressable>
      </View>
    </View>);
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    content: {
        flexGrow: 1,
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
    dateField: {
        borderRadius: 18,
        backgroundColor: theme.colors.background,
        borderWidth: 1,
        borderColor: theme.colors.line,
        paddingHorizontal: 14,
        paddingVertical: 16,
    },
    dateFieldText: {
        color: theme.colors.text,
        fontSize: 15,
    },
    dateFieldPlaceholder: {
        color: theme.colors.textMuted,
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
        color: '#FFFFFF',
    },
    primaryButton: {
        borderRadius: 18,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    primaryButtonDisabled: {
        opacity: 0.6,
    },
    primaryButtonText: {
        color: '#FFFFFF',
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
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(17, 17, 17, 0.18)',
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
        borderWidth: 1,
        borderColor: theme.colors.line,
        padding: 18,
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
    sheetSection: {
        marginTop: 18,
        color: theme.colors.textSoft,
        fontSize: 13,
        fontWeight: '700',
    },
    monthGrid: {
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    monthChip: {
        width: '22%',
        borderRadius: 16,
        backgroundColor: theme.colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    monthChipActive: {
        backgroundColor: theme.colors.accent,
    },
    monthChipText: {
        color: theme.colors.text,
        fontSize: 13,
        fontWeight: '700',
    },
    monthChipTextActive: {
        color: '#FFFFFF',
    },
    pickerRow: {
        marginTop: 18,
        flexDirection: 'row',
        gap: 12,
    },
    stepperCard: {
        flex: 1,
        borderRadius: 20,
        backgroundColor: theme.colors.surfaceAlt,
        padding: 14,
    },
    stepperLabel: {
        color: theme.colors.textSoft,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    stepperValue: {
        marginTop: 10,
        color: theme.colors.text,
        fontSize: 28,
        fontWeight: '800',
    },
    stepperButtons: {
        marginTop: 14,
        flexDirection: 'row',
        gap: 10,
    },
    stepperButton: {
        flex: 1,
        borderRadius: 14,
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.line,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    stepperButtonText: {
        color: theme.colors.text,
        fontSize: 18,
        fontWeight: '800',
    },
    sheetActions: {
        marginTop: 20,
        flexDirection: 'row',
        gap: 12,
    },
    sheetButtonMuted: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: theme.colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    sheetButtonMutedText: {
        color: theme.colors.text,
        fontSize: 14,
        fontWeight: '700',
    },
    sheetButtonFilled: {
        flex: 1,
        borderRadius: 18,
        backgroundColor: theme.colors.accent,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
    },
    sheetButtonFilledText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '800',
    },
});
