import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
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

import {
    AuthServiceError,
    PASSWORD_RESET_AVAILABLE,
    PASSWORD_RESET_UNAVAILABLE_MESSAGE,
    authService,
} from '@/services/authService';
import { takeDraftEmail } from '@/store/auth-draft';

const schema = z.object({
    email: z.string().trim().email('Enter a valid email address.'),
});

/*
 * Forgot password: the learner enters their account email and the server
 * emails a reset link. Email reset is not live yet (PASSWORD_RESET_AVAILABLE
 * in authService), so for now the screen says so and points to the admin.
 */
export default function ForgotPassword() {
    // The email typed on the login screen, if any (read once).
    const [initialEmail] = useState(takeDraftEmail);

    // { tone: 'info' | 'success' | 'error', text }
    const [result, setResult] = useState(null);

    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: initialEmail },
    });

    const onSubmit = async ({ email }) => {
        Keyboard.dismiss();
        setResult(null);
        try {
            await authService.requestPasswordReset(email);
            setResult({
                tone: 'success',
                text: `If an account exists for ${email.trim()}, a reset link is on its way. Check your inbox.`,
            });
        } catch (error) {
            const unavailable = error instanceof AuthServiceError && error.message === PASSWORD_RESET_UNAVAILABLE_MESSAGE;
            setResult({
                tone: unavailable ? 'info' : 'error',
                text: error instanceof AuthServiceError ? error.message : 'Unable to send the reset link right now. Please try again.',
            });
        }
    };

    const goBack = () => {
        if (router.canGoBack()) router.back();
        else router.replace('/(auth)/login');
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
                    <View style={styles.header}>
                        <View style={styles.iconCircle}>
                            <Text style={styles.icon}>🔑</Text>
                        </View>
                        <Text style={styles.eyebrow}>GAMIFRENCH</Text>
                        <Text style={styles.title}>Forgot your password?</Text>
                        <Text style={styles.subtitle}>
                            Enter the email you signed up with and we will send you a link to reset it.
                        </Text>
                    </View>

                    <View style={styles.form}>
                        {!PASSWORD_RESET_AVAILABLE ? (
                            <View style={styles.notice} accessibilityRole="summary">
                                <Text style={styles.noticeTitle}>Unavailable for now</Text>
                                <Text style={styles.noticeText}>
                                    Email reset is coming soon. Until then, please contact your admin to reset your
                                    password.
                                </Text>
                            </View>
                        ) : null}

                        <View style={styles.field}>
                            <Text style={styles.label}>Email</Text>
                            <View style={[styles.inputRow, errors.email && styles.inputRowError]}>
                                <Controller
                                    control={control}
                                    name="email"
                                    render={({ field: { onChange, onBlur, value } }) => (
                                        <TextInput
                                            value={value}
                                            onChangeText={onChange}
                                            onBlur={onBlur}
                                            style={styles.input}
                                            placeholder="Email"
                                            placeholderTextColor="#8A92A3"
                                            accessibilityLabel="Email"
                                            accessibilityInvalid={!!errors.email}
                                            autoCapitalize="none"
                                            keyboardType="email-address"
                                            autoComplete="email"
                                            autoCorrect={false}
                                            spellCheck={false}
                                            textContentType="emailAddress"
                                            editable={!isSubmitting}
                                            returnKeyType="send"
                                            onSubmitEditing={handleSubmit(onSubmit)}
                                        />
                                    )}
                                />
                            </View>
                            {errors.email ? (
                                <Text style={styles.error} accessibilityRole="alert">{errors.email.message}</Text>
                            ) : null}
                        </View>

                        {result ? (
                            <Text
                                style={[
                                    styles.result,
                                    result.tone === 'success' && styles.resultSuccess,
                                    result.tone === 'info' && styles.resultInfo,
                                    result.tone === 'error' && styles.resultError,
                                ]}
                                accessibilityRole="alert"
                            >
                                {result.text}
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
                                <Text style={styles.primaryButtonText}>Send reset link</Text>
                            )}
                        </Pressable>
                    </View>

                    <Text style={styles.link} onPress={goBack} accessibilityRole="link">
                        Back to sign in
                    </Text>
                </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
    scrollContainer: { flexGrow: 1, padding: 24, justifyContent: 'center' },

    header: { alignItems: 'center', marginBottom: 28 },
    iconCircle: {
        width: 96,
        height: 96,
        borderRadius: 48,
        backgroundColor: '#E8F1FB',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    icon: { fontSize: 44 },
    eyebrow: { color: '#1476D4', fontSize: 13, fontWeight: '800', letterSpacing: 2.5 },
    title: { color: '#182133', fontSize: 28, fontWeight: '800', marginTop: 12, textAlign: 'center' },
    subtitle: { color: '#647084', fontSize: 15, lineHeight: 22, marginTop: 8, textAlign: 'center' },

    form: { gap: 20 },
    notice: {
        backgroundColor: '#FFF8E6',
        borderColor: '#F5C451',
        borderWidth: 1.5,
        borderRadius: 14,
        padding: 16,
        gap: 4,
    },
    noticeTitle: { color: '#8A5A00', fontSize: 15, fontWeight: '800' },
    noticeText: { color: '#8A5A00', fontSize: 14, lineHeight: 20 },

    field: { gap: 8 },
    label: { color: '#344054', fontSize: 14, fontWeight: '700' },
    inputRow: {
        minHeight: 56,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1.5,
        borderColor: '#D8DEE9',
        borderRadius: 14,
        paddingHorizontal: 16,
    },
    inputRowError: { borderColor: '#B42318', backgroundColor: '#FEF3F2' },
    input: { flex: 1, color: '#182133', fontSize: 16, minHeight: 56 },
    error: { color: '#B42318', fontSize: 13, fontWeight: '500', marginTop: 2 },

    result: { borderRadius: 12, padding: 16, lineHeight: 22, fontWeight: '500', overflow: 'hidden' },
    resultSuccess: { color: '#05603A', backgroundColor: '#ECFDF3' },
    resultInfo: { color: '#8A5A00', backgroundColor: '#FFF8E6' },
    resultError: { color: '#B42318', backgroundColor: '#FEF3F2' },

    primaryButton: {
        minHeight: 58,
        borderRadius: 16,
        backgroundColor: '#1476D4',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
    pressed: { opacity: 0.85, transform: [{ scale: 0.98 }] },
    disabledButton: { backgroundColor: '#A0C4E8' },

    link: {
        color: '#1476D4',
        textAlign: 'center',
        fontWeight: '700',
        marginTop: 24,
        padding: 12,
        fontSize: 15,
    },
});
