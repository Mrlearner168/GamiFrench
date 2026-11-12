import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/store/auth-context';

/*
 * Deep-link landing for `gamifrench://join/<classCode>`.
 *
 * A teacher's QR encodes this URL. When a learner scans it:
 *   - Not signed in  -> they're sent to registration with the code pre-filled.
 *   - Signed in as a learner -> they can join (or switch to) the class directly.
 *   - Signed in as staff    -> an explanatory note (the link is for students).
 */
export default function JoinByCode() {
    const { code } = useLocalSearchParams();
    const teacherCode = Array.isArray(code) ? code[0] : (code ?? '').trim();
    const { session, isLoading, authenticatedRequest } = useAuth();
    const [joining, setJoining] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Not authenticated: hand off to registration with the code pre-filled.
    if (!isLoading && !session) {
        return teacherCode
            ? <Redirect href={{ pathname: '/(auth)/register', params: { teacherCode } }} />
            : <Redirect href="/(auth)/register" />;
    }

    const isStudent = session?.user?.role === 'student';

    async function joinClass() {
        if (!session || !teacherCode) return;
        setJoining(true);
        setErrorMessage('');
        try {
            await authenticatedRequest('/auth/me/teacher', {
                method: 'POST',
                body: JSON.stringify({ teacherCode }),
            });
            const destination = session.user.onboardingComplete === false ? '/welcome' : '/(game)/home';
            router.replace(destination);
        } catch (err) {
            setErrorMessage(err?.message || 'Could not join this class. Check the code and try again.');
            setJoining(false);
        }
    }

    return (
        <SafeAreaView style={styles.safe}>
            <ScrollView contentContainerStyle={styles.content}>
                {isLoading ? (
                    <ActivityIndicator color="#1476D4" />
                ) : (
                    <View style={styles.card}>
                        <Text style={styles.title}>Join a class</Text>

                        {isStudent ? (
                            <>
                                <Text style={styles.code}>{teacherCode || '—'}</Text>
                                <Text style={styles.copy}>
                                    {session?.user?.teacherName
                                        ? `You're currently with ${session.user.teacherName}. Joining will move you to the teacher who shared this code.`
                                        : "You're not in a class yet. Join the teacher who shared this code."}
                                </Text>
                                {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
                                <Pressable
                                    accessibilityRole="button"
                                    onPress={joinClass}
                                    disabled={joining || !teacherCode}
                                    style={[styles.button, (joining || !teacherCode) && styles.disabled]}
                                >
                                    {joining ? (
                                        <ActivityIndicator color="#FFFFFF" />
                                    ) : (
                                        <Text style={styles.buttonText}>Join this class</Text>
                                    )}
                                </Pressable>
                            </>
                        ) : (
                            <Text style={styles.copy}>
                                This invite link is for students to join a class. You&apos;re signed in
                                as a {session?.user?.role ?? 'staff member'}.
                            </Text>
                        )}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: '#F5F7FA' },
    content: { flexGrow: 1, padding: 24, justifyContent: 'center' },
    card: { backgroundColor: '#FFFFFF', borderRadius: 20, padding: 24, elevation: 3 },
    title: { fontSize: 24, fontWeight: '800', color: '#182133', marginBottom: 18 },
    code: {
        fontFamily: 'Courier',
        fontSize: 36,
        fontWeight: '800',
        color: '#1476D4',
        letterSpacing: 5,
        marginBottom: 12,
    },
    copy: { fontSize: 15, color: '#647084', lineHeight: 22, marginBottom: 16 },
    error: { color: '#B42318', fontWeight: '600', marginBottom: 12 },
    button: {
        backgroundColor: '#1476D4',
        borderRadius: 14,
        minHeight: 52,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 16 },
    disabled: { backgroundColor: '#A0C4E8' },
});