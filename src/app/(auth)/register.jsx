import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { z } from 'zod';

import { AuthServiceError } from '@/services/authService';
import { useAuth } from '@/store/auth-context';

const schema = z.object({
	firstName: z.string().trim().min(1, 'First name is required.'),
	lastName: z.string().trim().min(1, 'Last name is required.'),
	email: z.string().trim().email('Enter a valid email address.'),
	password: z.string().min(8, 'Use at least 8 characters.'),
	confirmPassword: z.string(),
	username: z.string().trim().optional(),
}).refine((values) => values.password === values.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match.' });

export default function Register() {
	const router = useRouter();
	const { signUp } = useAuth();
	const [serverError, setServerError] = useState('');
	const { control, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema), defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', username: '' } });

	const onSubmit = async (values) => {
		setServerError('');
		try { await signUp(values); router.replace('/(game)/home'); }
		catch (error) { setServerError(error instanceof AuthServiceError ? error.message : 'Unable to create your account right now.'); }
	};

	return (
		<SafeAreaView style={styles.container}>
			<ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
				<Link href="/(auth)/login" style={styles.back}>Back to sign in</Link>
				<Text style={styles.eyebrow}>YOUR FRENCH JOURNEY</Text>
				<Text style={styles.title}>Start learning.</Text>
				<Text style={styles.subtitle}>Create an account and build a daily habit that sticks.</Text>
				<View style={styles.form}>
					<Field control={control} name="firstName" label="First name" error={errors.firstName?.message} />
					<Field control={control} name="lastName" label="Last name" error={errors.lastName?.message} />
					<Field control={control} name="username" label="Username (optional)" error={errors.username?.message} autoCapitalize="none" />
					<Field control={control} name="email" label="Email" error={errors.email?.message} autoCapitalize="none" keyboardType="email-address" />
					<Field control={control} name="password" label="Password" error={errors.password?.message} secureTextEntry />
					<Field control={control} name="confirmPassword" label="Confirm password" error={errors.confirmPassword?.message} secureTextEntry />
					{serverError ? <Text style={styles.serverError} accessibilityRole="alert">{serverError}</Text> : null}
					<Pressable style={[styles.button, isSubmitting && styles.disabled]} disabled={isSubmitting} onPress={handleSubmit(onSubmit)} accessibilityRole="button"><Text style={styles.buttonText}>{isSubmitting ? 'Creating account...' : 'Create account'}</Text></Pressable>
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function Field({ control, name, label, error, ...props }) {
	return <View style={styles.field}><Text style={styles.label}>{label}</Text><Controller control={control} name={name} render={({ field: { onChange, onBlur, value } }) => <TextInput {...props} value={value} onChangeText={onChange} onBlur={onBlur} style={styles.input} placeholder={label} placeholderTextColor="#8A92A3" accessibilityLabel={label} />} />{error ? <Text style={styles.error}>{error}</Text> : null}</View>;
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F7F8FC' }, content: { padding: 24, paddingTop: 44, paddingBottom: 36 }, back: { color: '#1476D4', fontWeight: '700', marginBottom: 38 }, eyebrow: { color: '#1476D4', fontSize: 12, fontWeight: '800', letterSpacing: 2 }, title: { color: '#182133', fontSize: 36, fontWeight: '800', marginTop: 8 }, subtitle: { color: '#647084', fontSize: 16, lineHeight: 23, marginTop: 8, marginBottom: 26 }, form: { gap: 15 }, field: { gap: 7 }, label: { color: '#344054', fontSize: 14, fontWeight: '700' }, input: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D8DEE9', borderRadius: 14, color: '#182133', fontSize: 16, minHeight: 54, paddingHorizontal: 16 }, error: { color: '#B42318', fontSize: 13 }, serverError: { color: '#B42318', backgroundColor: '#FEF3F2', borderRadius: 10, padding: 12, lineHeight: 19 }, button: { minHeight: 56, borderRadius: 16, backgroundColor: '#1476D4', alignItems: 'center', justifyContent: 'center', marginTop: 6 }, buttonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' }, disabled: { opacity: 0.5 },
});
