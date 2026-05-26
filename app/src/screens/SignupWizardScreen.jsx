import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { theme } from '../design/tokens';

const TOTAL_STEPS = 3;
const CURRENT_YEAR_OPTIONS = [
  { label: 'First year', value: 'first' },
  { label: 'Second year', value: 'second' },
  { label: 'Third year', value: 'third' },
  { label: 'Fourth year', value: 'fourth' },
];
const BRANCH_OPTIONS = [
  { label: 'CS', value: 'CS' },
  { label: 'IT', value: 'IT' },
  { label: 'ENTC', value: 'ENTC' },
  { label: 'Mechanical', value: 'Mechanical' },
  { label: 'ARE', value: 'ARE' },
];
const SEMESTER_OPTIONS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'].map((semester) => ({
  label: semester,
  value: semester,
}));

export default function SignupWizardScreen({ email, onBack, onSubmit }) {
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeSelect, setActiveSelect] = useState(null);
  const [dateOfBirth, setDateOfBirth] = useState(new Date(2000, 0, 1));

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    password: '',
    confirmPassword: '',
    currentYear: '',
    branch: '',
    semester: '',
  });

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setLocalError(null);
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setDateOfBirth(selectedDate);
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const year = selectedDate.getFullYear();
      updateField('dob', `${day}/${month}/${year}`);
    }
  };

  const handleNext = () => {
    setLocalError(null);
    setActiveSelect(null);

    if (step === 1) {
      if (!form.firstName || !form.lastName || !form.dob || !form.password) {
        setLocalError('Please fill in all fields.');
        return;
      }
      if (form.password !== form.confirmPassword) {
        setLocalError('Passwords do not match.');
        return;
      }
      // Simple DOB validation
      if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.dob) && !/^\d{4}-\d{2}-\d{2}$/.test(form.dob)) {
         setLocalError('Please enter DOB in DD/MM/YYYY format.');
         return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!form.currentYear || !form.branch || !form.semester) {
        setLocalError('Please fill in your college details.');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
      setLocalError(null);
    } else {
      onBack();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setLocalError(null);
    
    // Pass the payload back to App.jsx
    const result = await onSubmit({
      profile: {
        firstName: form.firstName,
        lastName: form.lastName,
        dob: form.dob,
        password: form.password,
        email: email,
        currentYear: form.currentYear,
        branch: form.branch,
        semester: form.semester,
      },
      contactMethod: 'email',
    });

    setSubmitting(false);
    if (!result.ok) {
      setLocalError(result.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </Pressable>
          <Text style={styles.headerTitle}>Finish signing up</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.progressBarContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressSegment,
                s <= step ? styles.progressSegmentActive : styles.progressSegmentInactive,
              ]}
            />
          ))}
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
          {localError ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{localError}</Text>
            </View>
          ) : null}

          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Personal details</Text>
              
              <View style={styles.row}>
                <WizardField
                  label="First name"
                  value={form.firstName}
                  onChangeText={(val) => updateField('firstName', val)}
                  placeholder="John"
                />
                <WizardField
                  label="Last name"
                  value={form.lastName}
                  onChangeText={(val) => updateField('lastName', val)}
                  placeholder="Doe"
                />
              </View>

              <View style={styles.fieldContainer}>
                <Text style={styles.fieldLabel}>Date of birth</Text>
                <Pressable
                  onPress={() => setShowDatePicker(true)}
                  style={[styles.input, styles.dateInput]}
                >
                  <Text style={form.dob ? styles.dateText : styles.placeholderText}>
                    {form.dob || 'DD/MM/YYYY'}
                  </Text>
                </Pressable>
                {Platform.OS === 'android' && showDatePicker && (
                  <DateTimePicker
                    value={dateOfBirth}
                    mode="date"
                    display="default"
                    onChange={onDateChange}
                    maximumDate={new Date()}
                  />
                )}
                <Text style={styles.helperText}>To sign up, you need to be at least 18.</Text>
              </View>

              <WizardField
                label="Email"
                value={email}
                editable={false}
                helperText="We'll email you confirmations."
              />

              <WizardField
                label="Password"
                value={form.password}
                onChangeText={(val) => updateField('password', val)}
                placeholder="Password"
                secureTextEntry
              />

              <WizardField
                label="Confirm Password"
                value={form.confirmPassword}
                onChangeText={(val) => updateField('confirmPassword', val)}
                placeholder="Confirm Password"
                secureTextEntry
                customBorderColor={
                  form.confirmPassword.length > 0
                    ? form.password === form.confirmPassword
                      ? '#34C759' // iOS Green
                      : '#FF3B30' // iOS Red
                    : undefined
                }
              />
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>College details</Text>

              <SelectField
                label="Current year"
                value={form.currentYear}
                placeholder="Select year"
                options={CURRENT_YEAR_OPTIONS}
                open={activeSelect === 'currentYear'}
                onToggle={() => setActiveSelect(activeSelect === 'currentYear' ? null : 'currentYear')}
                onSelect={(val) => updateField('currentYear', val)}
              />

              <SelectField
                label="Branch"
                value={form.branch}
                placeholder="Select branch"
                options={BRANCH_OPTIONS}
                open={activeSelect === 'branch'}
                onToggle={() => setActiveSelect(activeSelect === 'branch' ? null : 'branch')}
                onSelect={(val) => updateField('branch', val)}
              />

              <SelectField
                label="Semester"
                value={form.semester}
                placeholder="Select semester"
                options={SEMESTER_OPTIONS}
                open={activeSelect === 'semester'}
                onToggle={() => setActiveSelect(activeSelect === 'semester' ? null : 'semester')}
                onSelect={(val) => updateField('semester', val)}
              />
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.stepTitle}>Agree to terms</Text>
              <Text style={styles.termsText}>
                By selecting Agree and continue, I agree to Sentri's{' '}
                <Text style={styles.linkText}>Terms of Service</Text>,{' '}
                <Text style={styles.linkText}>Payments Terms of Service</Text> and{' '}
                <Text style={styles.linkText}>Nondiscrimination Policy</Text> and acknowledge the{' '}
                <Text style={styles.linkText}>Privacy Policy</Text>.
              </Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Pressable
            style={[styles.primaryButton, submitting && styles.buttonDisabled]}
            onPress={step === 3 ? handleSubmit : handleNext}
            disabled={submitting}
          >
            <Text style={styles.primaryButtonText}>
              {submitting ? 'Please wait...' : step === 3 ? 'Agree and continue' : 'Next'}
            </Text>
          </Pressable>
        </View>

        {Platform.OS === 'ios' && (
          <Modal visible={showDatePicker} transparent animationType="slide">
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Pressable onPress={() => setShowDatePicker(false)}>
                    <Text style={styles.modalButtonText}>Done</Text>
                  </Pressable>
                </View>
                <DateTimePicker
                  value={dateOfBirth}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  textColor="#000"
                />
              </View>
            </View>
          </Modal>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function WizardField({ label, value, onChangeText, placeholder, secureTextEntry, keyboardType, editable = true, helperText, customBorderColor }) {
  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          !editable && styles.inputDisabled,
          customBorderColor ? { borderColor: customBorderColor, borderWidth: 1.5 } : null,
        ]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#A0A0A0"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize="none"
      />
      {helperText ? <Text style={styles.helperText}>{helperText}</Text> : null}
    </View>
  );
}

function SelectField({ label, value, placeholder, options, open, onToggle, onSelect }) {
  const selectedOption = options.find((option) => option.value === value);

  return (
    <View style={styles.fieldContainer}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Pressable style={styles.selectButton} onPress={onToggle}>
        <Text style={selectedOption ? styles.selectText : styles.placeholderText}>
          {selectedOption?.label || placeholder}
        </Text>
        <Ionicons
          name={open ? 'chevron-up' : 'chevron-down'}
          size={18}
          color="#8A8A8A"
        />
      </Pressable>

      {open ? (
        <View style={styles.selectMenu}>
          {options.map((option, index) => {
            const selected = option.value === value;

            return (
              <Pressable
                key={option.value}
                style={[styles.selectOption, index > 0 && styles.selectOptionDivider]}
                onPress={() => {
                  onSelect(option.value);
                  onToggle();
                }}
              >
                <View style={styles.selectCheckSlot}>
                  {selected ? <Ionicons name="checkmark" size={20} color="#000" /> : null}
                </View>
                <Text style={styles.selectOptionText}>{option.label}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoid: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: 56,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  progressBarContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    height: 4,
    gap: 4,
    marginBottom: 16,
  },
  progressSegment: {
    flex: 1,
    borderRadius: 2,
  },
  progressSegmentActive: {
    backgroundColor: '#000000',
  },
  progressSegmentInactive: {
    backgroundColor: '#E0E0E0',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  stepContainer: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#000',
    marginBottom: 24,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  fieldContainer: {
    flex: 1,
    marginBottom: 20,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 8,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#B0B0B0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#FFFFFF',
  },
  inputDisabled: {
    backgroundColor: '#F5F5F5',
    color: '#606060',
  },
  selectButton: {
    minHeight: 50,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 13,
    backgroundColor: '#F8F8F8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: '#000',
  },
  selectMenu: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#D8D8D8',
    borderRadius: 14,
    backgroundColor: '#F8F8F8',
    overflow: 'hidden',
  },
  selectOption: {
    minHeight: 52,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  selectOptionDivider: {
    borderTopWidth: 1,
    borderTopColor: '#D8D8D8',
  },
  selectCheckSlot: {
    width: 28,
    alignItems: 'center',
    marginRight: 8,
  },
  selectOptionText: {
    flex: 1,
    fontSize: 18,
    color: '#111',
  },
  dateInput: {
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: '#000',
  },
  placeholderText: {
    fontSize: 16,
    color: '#A0A0A0',
  },
  datePickerContainer: {
    alignItems: 'flex-start',
    marginTop: 4,
  },
  iosDatePicker: {
    height: 40,
    marginLeft: -10,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#D1D5DB', // Standard iOS light gray background for pickers
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    backgroundColor: '#F3F4F6',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#D1D5DB',
    padding: 12,
  },
  modalButtonText: {
    color: '#007AFF',
    fontSize: 16,
    fontWeight: '600',
  },
  helperText: {
    fontSize: 13,
    color: '#606060',
    marginTop: 6,
  },
  termsText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#000',
  },
  linkText: {
    color: '#1A73E8',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  footer: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },
  primaryButton: {
    height: 56,
    backgroundColor: '#000000',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    backgroundColor: '#FFF0F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#FFD0D0',
  },
  errorText: {
    color: '#D00000',
    fontSize: 14,
  },
});
