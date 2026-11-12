import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Image,
    Keyboard,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { PasswordVisibilityToggle } from '@/components/password-visibility-toggle';
import { PrivacyPolicyLink } from '@/components/privacy-policy-link';
import { ServerWakeBanner } from '@/components/server-wake-banner';
import { AuthServiceError } from '@/services/authService';
import { useAuth } from '@/store/auth-context';

const schema = z.object({
    firstName: z.string().trim().min(1, 'First name is required.'),
    lastName: z.string().trim().min(1, 'Last name is required.'),
    username: z.string().trim().optional(),
    gender: z.enum(['male', 'female'], { message: 'Select a gender.' }),
    email: z.string().trim().email('Enter a valid email address.'),
    // Mirrors the backend's ``valid_password`` validator in
    // ``utils/validator.RegisterInput`` so the user sees a specific message
    // here instead of a hidden 422 once they tap Submit.
    password: z
        .string()
        .min(8, 'Use at least 8 characters.')
        .regex(/[A-Z]/, 'Password must include an uppercase letter.')
        .regex(/[a-z]/, 'Password must include a lowercase letter.')
        .regex(/[\d]/, 'Password must include a number.'),
    confirmPassword: z.string(),
    teacherEmail: z.string().trim().email('Enter a valid teacher email.').optional().or(z.literal('')),
    teacherCode: z.string().trim().max(20, 'Teacher code is too long.').optional().or(z.literal('')),
}).refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match.',
});

export default function Register() {
    const { signUp } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const [teacherMethod, setTeacherMethod] = useState('code');

    // A QR / deep link (gamifrench://join/CODE) lands here with the class code
    // pre-filled, so a learner can skip typing it during registration.
    const params = useLocalSearchParams();
    const linkTeacherCode = Array.isArray(params.teacherCode)
        ? params.teacherCode[0]
        : (params.teacherCode ?? '').trim();

    const { control, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: {
            firstName: '',
            lastName: '',
            username: '',
            gender: 'male',
            email: '',
            password: '',
            confirmPassword: '',
            teacherEmail: '',
            teacherCode: linkTeacherCode,
        },
    });

    const onSubmit = async (values) => {
        Keyboard.dismiss();
        setServerError('');
        try {
            await signUp(values);
        } catch (error) {
            setServerError(
                error instanceof AuthServiceError 
                    ? error.message 
                    : 'Unable to create your account right now. Please try again.'
            );
        }
    };

    const chooseTeacherMethod = (method) => {
        setTeacherMethod(method);
        // Only the active field should be sent: the backend resolves a single
        // identifier, so clear the other one after a mid-edit toggle.
        if (method === 'email') {
            setValue('teacherCode', '', { shouldDirty: false, shouldValidate: false });
        } else {
            setValue('teacherEmail', '', { shouldDirty: false, shouldValidate: false });
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
                <KeyboardAwareScrollView
                    bottomOffset={24}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    {/* Centered Header Section */}
                    <View style={styles.header}>
                        <View style={styles.brandMark}>
                            <Image 
                                source={require('@/assets/images/icon.png')} 
                                style={styles.logoImage} 
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={styles.eyebrow}>YOUR FRENCH JOURNEY</Text>
                        <Text style={styles.title}>Start learning.</Text>
                        <Text style={styles.subtitle}>
                            Create an account and build a daily habit that sticks.
                        </Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <ServerWakeBanner />

                        {/* First Name & Last Name Side-by-Side */}
                        <View style={styles.row}>
                            <View style={styles.halfWidth}>
                                <Field
                                    control={control}
                                    name="firstName"
                                    label="First name"
                                    error={errors.firstName?.message}
                                    autoCapitalize="words"
                                    autoComplete="given-name"
                                    editable={!isSubmitting}
                                />
                            </View>
                            <View style={styles.halfWidth}>
                                <Field
                                    control={control}
                                    name="lastName"
                                    label="Last name"
                                    error={errors.lastName?.message}
                                    autoCapitalize="words"
                                    autoComplete="family-name"
                                    editable={!isSubmitting}
                                />
                            </View>
                        </View>

                        <GenderSelector
                            control={control}
                            error={errors.gender?.message}
                            disabled={isSubmitting}
                        />

                        <Field
                            control={control}
                            name="username"
                            label="Username (optional)"
                            error={errors.username?.message}
                            autoCapitalize="none"
                            autoComplete="username"
                            autoCorrect={false}
                            spellCheck={false}
                            editable={!isSubmitting}
                        />

                        <Field
                            control={control}
                            name="email"
                            label="Email"
                            error={errors.email?.message}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                            autoCorrect={false}
                            spellCheck={false}
                            editable={!isSubmitting}
                        />

                        <Field
                            control={control}
                            name="password"
                            label="Password"
                            error={errors.password?.message}
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="new-password"
                            autoCorrect={false}
                            spellCheck={false}
                            editable={!isSubmitting}
                        >
                            <PasswordVisibilityToggle
                                visible={showPassword}
                                onPress={() => setShowPassword((prev) => !prev)}
                                disabled={isSubmitting}
                            />
                        </Field>

                        <Field
                            control={control}
                            name="confirmPassword"
                            label="Confirm password"
                            error={errors.confirmPassword?.message}
                            secureTextEntry={!showConfirmPassword}
                            autoCapitalize="none"
                            autoComplete="new-password"
                            autoCorrect={false}
                            spellCheck={false}
                            editable={!isSubmitting}
                        >
                            <PasswordVisibilityToggle
                                visible={showConfirmPassword}
                                onPress={() => setShowConfirmPassword((prev) => !prev)}
                                disabled={isSubmitting}
                            />
                        </Field>

                        {/* Teacher assignment (optional) */}
                        <View style={styles.field}>
                            <Text style={styles.label}>Teacher (optional)</Text>
                            <View style={styles.genderRow}>
                                <Pressable
                                    onPress={() => chooseTeacherMethod('email')}
                                    disabled={isSubmitting}
                                    style={[
                                        styles.genderOption,
                                        teacherMethod === 'email' && styles.genderOptionSelected,
                                    ]}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: teacherMethod === 'email', disabled: isSubmitting }}
                                    accessibilityLabel="Join by teacher email"
                                >
                                    <Text style={[styles.genderLabel, teacherMethod === 'email' && styles.genderLabelSelected]}>
                                        By email
                                    </Text>
                                </Pressable>
                                <Pressable
                                    onPress={() => chooseTeacherMethod('code')}
                                    disabled={isSubmitting}
                                    style={[
                                        styles.genderOption,
                                        teacherMethod === 'code' && styles.genderOptionSelected,
                                    ]}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected: teacherMethod === 'code', disabled: isSubmitting }}
                                    accessibilityLabel="Join by class code"
                                >
                                    <Text style={[styles.genderLabel, teacherMethod === 'code' && styles.genderLabelSelected]}>
                                        By class code
                                    </Text>
                                </Pressable>
                            </View>

                            {teacherMethod === 'email' ? (
                                <Field
                                    control={control}
                                    name="teacherEmail"
                                    label="Teacher email"
                                    error={errors.teacherEmail?.message}
                                    keyboardType="email-address"
                                    autoCapitalize="none"
                                    autoComplete="email"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    editable={!isSubmitting}
                                />
                            ) : (
                                <Field
                                    control={control}
                                    name="teacherCode"
                                    label="Teacher class code"
                                    error={errors.teacherCode?.message}
                                    autoCapitalize="characters"
                                    autoComplete="off"
                                    autoCorrect={false}
                                    spellCheck={false}
                                    editable={!isSubmitting}
                                />
                            )}
                            <Text style={styles.hint}>
                                Ask your teacher for their class code or email.
                            </Text>
                        </View>
                        {serverError ? (
                            <Text style={styles.serverError} accessibilityRole="alert">
                                {serverError}
                            </Text>
                        ) : null}

                        <Pressable
                            style={({ pressed }) => [
                                styles.primaryButton,
                                pressed && styles.pressed,
                                isSubmitting && styles.disabledButton,
                            ]}
                            disabled={isSubmitting}
                            onPress={handleSubmit(onSubmit)}
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isSubmitting }}
                        >
                            {isSubmitting ? (
                                <ActivityIndicator color="#FFFFFF" size="small" />
                            ) : (
                                <Text style={styles.primaryButtonText}>Create account</Text>
                            )}
                        </Pressable>
                    </View>

                    <Link href="/(auth)/login" style={styles.link} disabled={isSubmitting}>
                        Already have an account? Sign in
                    </Link>
                    <PrivacyPolicyLink disabled={isSubmitting} />
                </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

function Field({ control, name, label, error, children, ...inputProps }) {
    return (
        <View style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <View style={[styles.inputRow, error && styles.inputRowError]}>
                <Controller
                    control={control}
                    name={name}
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            {...inputProps}
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            style={styles.input}
                            placeholder={label}
                            placeholderTextColor="#8A92A3"
                            accessibilityLabel={label}
                            accessibilityInvalid={!!error}
                        />
                    )}
                />
                {children}
            </View>
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        </View>
    );
}

function GenderSelector({ control, error, disabled }) {
    const options = [
        { value: 'male', label: 'Male', emoji: '👨' },
        { value: 'female', label: 'Female', emoji: '👩' },
    ];

    return (
        <View style={styles.field}>
            <Text style={styles.label}>Gender</Text>
            <Controller
                control={control}
                name="gender"
                render={({ field: { onChange, value } }) => (
                    <View style={styles.genderRow}>
                        {options.map((option) => {
                            const selected = value === option.value;
                            return (
                                <Pressable
                                    key={option.value}
                                    onPress={() => onChange(option.value)}
                                    disabled={disabled}
                                    style={({ pressed }) => [
                                        styles.genderOption,
                                        selected && styles.genderOptionSelected,
                                        pressed && styles.pressed,
                                    ]}
                                    accessibilityRole="radio"
                                    accessibilityState={{ selected, disabled }}
                                    accessibilityLabel={option.label}
                                >
                                    <Text style={styles.genderEmoji}>{option.emoji}</Text>
                                    <Text
                                        style={[
                                            styles.genderLabel,
                                            selected && styles.genderLabelSelected,
                                        ]}
                                    >
                                        {option.label}
                                    </Text>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            />
            {error ? <Text style={styles.error} accessibilityRole="alert">{error}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
    scrollContainer: {
        flexGrow: 1,
        padding: 24,
        paddingTop: 16,
        paddingBottom: 36,
        justifyContent: 'center',
    },

    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    brandMark: { 
        width: 150, 
        height: 150, 
        borderRadius: 75, 
        backgroundColor: '#1476D4', 
        alignItems: 'center', 
        justifyContent: 'center', 
        marginBottom: 20,
        overflow: 'hidden',
        shadowColor: '#1476D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    logoImage: {
        width: '100%',
        height: '100%',
    },
    
    eyebrow: { color: '#1476D4', fontSize: 13, fontWeight: '800', letterSpacing: 2.5 },
    title: { color: '#182133', fontSize: 32, fontWeight: '800', marginTop: 10, textAlign: 'center' },
    subtitle: { color: '#647084', fontSize: 15, marginTop: 6, textAlign: 'center', lineHeight: 22 },

    form: { gap: 16 },
    row: { flexDirection: 'row', gap: 12 },
    halfWidth: { flex: 1 },
    field: { gap: 6 },
    label: { color: '#344054', fontSize: 14, fontWeight: '700' },
    hint: { color: '#647084', fontSize: 13, lineHeight: 18 },
    genderRow: { flexDirection: 'row', gap: 12 },
    genderOption: {
        flex: 1,
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#D8DEE9',
        borderRadius: 14,
    },
    genderOptionSelected: {
        borderColor: '#1476D4',
        backgroundColor: '#EAF3FC',
    },
    genderEmoji: { fontSize: 22 },
    genderLabel: { color: '#647084', fontSize: 15, fontWeight: '600' },
    genderLabelSelected: { color: '#1476D4', fontWeight: '800' },
    inputRow: {
        minHeight: 54,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#D8DEE9',
        borderRadius: 14,
        paddingHorizontal: 16,
    },
    inputRowError: {
        borderColor: '#B42318',
        backgroundColor: '#FEF3F2',
    },
    input: { flex: 1, color: '#182133', fontSize: 16, minHeight: 54 },

    error: { color: '#B42318', fontSize: 13, fontWeight: '500', marginTop: 2 },
    serverError: {
        color: '#B42318',
        backgroundColor: '#FEF3F2',
        borderRadius: 12,
        padding: 14,
        lineHeight: 20,
        fontWeight: '500',
        overflow: 'hidden',
    },
    primaryButton: {
        minHeight: 56,
        borderRadius: 16,
        backgroundColor: '#1476D4',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
        shadowColor: '#1476D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    disabledButton: { backgroundColor: '#A0C4E8', elevation: 0, shadowOpacity: 0 },
    disabledText: { opacity: 0.5 },
    link: {
        color: '#1476D4',
        textAlign: 'center',
        fontWeight: '700',
        marginTop: 28,
        padding: 10,
        fontSize: 15,
    },
});