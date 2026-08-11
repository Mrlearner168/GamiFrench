import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
    ActivityIndicator,
    Image, // <--- ADDED MISSING IMPORT
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AuthServiceError } from '@/services/authService';
import { useAuth } from '@/store/auth-context';

const schema = z.object({
    email: z.string().trim().email('Enter a valid email address.'),
    password: z.string().min(8, 'Password must be at least 8 characters.'),
});

export default function Login() {
    const router = useRouter();
    const { signIn } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [serverError, setServerError] = useState('');
    
    const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        resolver: zodResolver(schema),
        defaultValues: { email: '', password: '' },
    });

    const onSubmit = async (values) => {
        Keyboard.dismiss();
        setServerError('');
        try {
            await signIn(values);
            router.replace('/(game)/home');
        } catch (error) {
            setServerError(error instanceof AuthServiceError ? error.message : 'Unable to sign in right now. Please try again.');
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView 
                style={styles.keyboardAvoid} 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            >
                <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
                    <ScrollView 
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
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
                            <Text style={styles.eyebrow}>GAMIFRENCH</Text>
                            <Text style={styles.title}>Welcome back.</Text>
                            <Text style={styles.subtitle}>A few minutes of French, every day.</Text>
                        </View>

                        {/* Form Section */}
                        <View style={styles.form}>
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
                                autoComplete="password"
                                autoCorrect={false}
                                spellCheck={false}
                                editable={!isSubmitting}
                            >
                                <Pressable 
                                    onPress={() => setShowPassword((value) => !value)} 
                                    accessibilityRole="button" 
                                    accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                                    disabled={isSubmitting}
                                >
                                    <Text style={[styles.showPassword, isSubmitting && styles.disabledText]}>
                                        {showPassword ? 'Hide' : 'Show'}
                                    </Text>
                                </Pressable>
                            </Field>

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
                                    <ActivityIndicator color="#FFFFFF" size="small" />
                                ) : (
                                    <Text style={styles.primaryButtonText}>Sign in</Text>
                                )}
                            </Pressable>
                        </View>

                        <Link href="/(auth)/register" style={styles.link} disabled={isSubmitting}>
                            Create a student account
                        </Link>
                    </ScrollView>
                </TouchableWithoutFeedback>
            </KeyboardAvoidingView>
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
    keyboardAvoid: { flex: 1 },
    scrollContainer: { 
        flexGrow: 1, 
        padding: 24, 
        justifyContent: 'center' 
    },
    
    header: {
        alignItems: 'center',
        marginBottom: 32,
    },
    brandMark: { 
        width: 250, 
        height: 250, 
        borderRadius: 150, 
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
    showPassword: { color: '#1476D4', fontWeight: '700', paddingVertical: 12, paddingLeft: 12 },
    
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
    disabledText: { opacity: 0.5 },
    link: { 
        color: '#1476D4', 
        textAlign: 'center', 
        fontWeight: '700', 
        marginTop: 32, 
        padding: 12,
        fontSize: 15
    },
});