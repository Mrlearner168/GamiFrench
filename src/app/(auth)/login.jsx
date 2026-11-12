import { zodResolver } from '@hookform/resolvers/zod';
import { Link, router } from 'expo-router';
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
    useWindowDimensions,
    View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { PasswordVisibilityToggle } from '@/components/password-visibility-toggle';
import { AdminDashboardLink } from '@/components/admin-dashboard-link';
import { PrivacyPolicyLink } from '@/components/privacy-policy-link';
import { ServerWakeBanner } from '@/components/server-wake-banner';
import { AuthServiceError } from '@/services/authService';
import { useServerStatus } from '@/services/serverWarmup';
import { useAuth } from '@/store/auth-context';
import { setDraftEmail } from '@/store/auth-draft';

const schema = z.object({
    email: z.string().trim().email('Enter a valid email address.'),
    // Sign-in only checks that a password was typed: the length rule belongs
    // to registration, and the server decides whether the password is right.
    password: z.string().min(1, 'Enter your password.'),
});

export default function Login() {
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    const { phase } = useServerStatus();
    const { height } = useWindowDimensions();
    // The logo used to be a fixed 250px circle that pushed the form below
    // the fold on small phones; scale it with the screen instead.
    const logoSize = Math.round(Math.min(160, Math.max(96, height * 0.18)));

    const { control, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (values) => {
        Keyboard.dismiss();
        setServerError('');
        try {
            await signIn({ ...values, email: values.email.trim() });
        } catch (error) {
            setServerError(error instanceof AuthServiceError ? error.message : 'Unable to sign in right now. Please try again.');
        }
    };

    // Carry the email already typed over to the reset screen (in memory,
    // never in the URL).
    const openForgotPassword = () => {
        setDraftEmail(getValues('email'));
        router.push('/(auth)/forgot-password');
    };

    return (
        <SafeAreaView style={styles.safeArea}>
                {/* No TouchableWithoutFeedback wrapper: it swallowed scroll
                  * gestures on Android and clicks on web. Dragging the
                  * form dismisses the keyboard instead. */}
                <KeyboardAwareScrollView
                    bottomOffset={24}
                    contentContainerStyle={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    keyboardDismissMode="on-drag"
                >
                    {/* Centered Header Section */}
                    <View style={styles.header}>
                        <View style={[styles.brandMark, { width: logoSize, height: logoSize, borderRadius: logoSize / 2 }]}>
                            <Image 
                                source={require('@/assets/images/icon.png')} 
                                style={styles.logoImage} 
                                resizeMode="cover"
                            />
                        </View>
                        <Text style={styles.eyebrow}>GAMIFRENCH</Text>
                        <Text style={styles.title}>Welcome back.</Text>
                        <Text style={styles.subtitle}>A few minutes of French, every day.</Text>
                    </View>

                    {/* Form Section */}
                    <View style={styles.form}>
                        <ServerWakeBanner />

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
                            textContentType="emailAddress"
                            returnKeyType="next"
                        />
                        
                        <Field 
                            control={control} 
                            name="password" 
                            label="Password" 
                            error={errors.password?.message} 
                            secureTextEntry={!showPassword}
                            autoCapitalize="none"
                            autoComplete="password"
                            autoCorrect={false}
                            spellCheck={false}
                            editable={!isSubmitting}
                            textContentType="password"
                            returnKeyType="go"
                            onSubmitEditing={handleSubmit(onSubmit)}
                        >
                            <PasswordVisibilityToggle
                                visible={showPassword}
                                onPress={() => setShowPassword((value) => !value)}
                                disabled={isSubmitting}
                            />
                        </Field>

                        <Text
                            style={[styles.forgotLink, isSubmitting && styles.linkDisabled]}
                            onPress={isSubmitting ? undefined : openForgotPassword}
                            accessibilityRole="link"
                            accessibilityState={{ disabled: isSubmitting }}
                        >
                            Forgot password?
                        </Text>

                        {serverError ? (
                            <Text style={styles.serverError} accessibilityRole="alert">
                                {serverError}
                            </Text>
                        ) : null}

                        <Pressable 
                            style={({ pressed }) => [
                                styles.primaryButton, 
                                pressed && styles.pressed, 
                                isSubmitting && styles.disabledButton
                            ]} 
                            disabled={isSubmitting} 
                            onPress={handleSubmit(onSubmit)} 
                            accessibilityRole="button"
                            accessibilityState={{ disabled: isSubmitting }}
                        >
                            {isSubmitting ? (
                                <View style={styles.buttonBusy}>
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                    <Text style={styles.primaryButtonText}>
                                        {phase === 'waking' ? 'Waking server…' : 'Signing in…'}
                                    </Text>
                                </View>
                            ) : (
                                <Text style={styles.primaryButtonText}>Sign in</Text>
                            )}
                        </Pressable>
                    </View>

                    {/* Small text links side by side, like "Forgot password?". */}
                    <View style={styles.linkRow}>
                        <Link href="/(auth)/register" style={styles.link} disabled={isSubmitting}>
                            Create a student account
                        </Link>
                        <Text style={styles.linkDivider}>·</Text>
                        <AdminDashboardLink disabled={isSubmitting} />
                        <Text style={styles.linkDivider}>·</Text>
                        <PrivacyPolicyLink disabled={isSubmitting} />
                    </View>
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

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: '#F7F8FC' },
    scrollContainer: { 
        flexGrow: 1, 
        padding: 24, 
        justifyContent: 'center' 
    },
    
    header: {
        alignItems: 'center',
        marginBottom: 28,
    },
    brandMark: {
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
    title: { color: '#182133', fontSize: 32, fontWeight: '800', marginTop: 12, textAlign: 'center' },
    subtitle: { color: '#647084', fontSize: 16, marginTop: 8, textAlign: 'center' },
    
    form: { gap: 20 },
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
        paddingHorizontal: 16 
    },
    inputRowError: {
        borderColor: '#B42318',
        backgroundColor: '#FEF3F2',
    },
    input: { flex: 1, color: '#182133', fontSize: 16, minHeight: 56 },
    
    error: { color: '#B42318', fontSize: 13, fontWeight: '500', marginTop: 2 },
    serverError: { 
        color: '#B42318', 
        backgroundColor: '#FEF3F2', 
        borderRadius: 12, 
        padding: 16, 
        lineHeight: 22,
        fontWeight: '500',
        overflow: 'hidden'
    },
    primaryButton: { 
        minHeight: 58, 
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
    buttonBusy: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    linkRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 24,
    },
    link: {
        color: '#1476D4',
        textAlign: 'center',
        fontWeight: '700',
        paddingVertical: 12,
        paddingHorizontal: 6,
        fontSize: 14
    },
    // Sits right under the password field (the form's 20px gap is pulled in).
    forgotLink: {
        alignSelf: 'flex-end',
        color: '#1476D4',
        fontWeight: '700',
        fontSize: 14,
        marginTop: -12,
        paddingVertical: 4,
        paddingLeft: 12,
    },
    linkDisabled: { opacity: 0.5 },
    linkDivider: {
        color: '#94A3B8',
        fontSize: 14,
    },
});