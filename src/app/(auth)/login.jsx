import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
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
		setServerError('');
		try {
			await signIn(values);
			router.replace('/(game)/home');
		} catch (error) {
			setServerError(error instanceof AuthServiceError ? error.message : 'Unable to sign in right now.');
		}
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={styles.brandMark}><Text style={styles.brandMarkText}>A</Text></View>
			<Text style={styles.eyebrow}>GAMIFRENCH</Text>
			<Text style={styles.title}>Welcome back.</Text>
			<Text style={styles.subtitle}>A few minutes of French, every day.</Text>

			<View style={styles.form}>
				<Field control={control} name="email" label="Email" error={errors.email?.message} autoCapitalize="none" keyboardType="email-address" />
				<Field control={control} name="password" label="Password" error={errors.password?.message} secureTextEntry={!showPassword}>
					<Pressable onPress={() => setShowPassword((value) => !value)} accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}>
						<Text style={styles.showPassword}>{showPassword ? 'Hide' : 'Show'}</Text>
					</Pressable>
				</Field>
				{serverError ? <Text style={styles.serverError} accessibilityRole="alert">{serverError}</Text> : null}
				<Pressable style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed, isSubmitting && styles.disabled]} disabled={isSubmitting} onPress={handleSubmit(onSubmit)} accessibilityRole="button">
					<Text style={styles.primaryButtonText}>{isSubmitting ? 'Signing in...' : 'Sign in'}</Text>
				</Pressable>
			</View>

			<Link href="/(auth)/register" style={styles.link}>Create a student account</Link>
		</SafeAreaView>
	);
}

function Field({ control, name, label, error, children, ...inputProps }) {
	return (
		<View style={styles.field}>
			<Text style={styles.label}>{label}</Text>
			<View style={styles.inputRow}>
				<Controller control={control} name={name} render={({ field: { onChange, onBlur, value } }) => (
					<TextInput {...inputProps} value={value} onChangeText={onChange} onBlur={onBlur} style={styles.input} placeholder={label} placeholderTextColor="#8A92A3" accessibilityLabel={label} />
				)} />
				{children}
			</View>
			{error ? <Text style={styles.error}>{error}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, backgroundColor: '#F7F8FC', padding: 24, justifyContent: 'center' },
	brandMark: { width: 56, height: 56, borderRadius: 18, backgroundColor: '#1476D4', alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
	brandMarkText: { color: '#FFFFFF', fontSize: 30, fontWeight: '800' },
	eyebrow: { color: '#1476D4', fontSize: 12, fontWeight: '800', letterSpacing: 2 },
	title: { color: '#182133', fontSize: 36, fontWeight: '800', marginTop: 8 },
	subtitle: { color: '#647084', fontSize: 16, marginTop: 8, marginBottom: 30 },
	form: { gap: 18 },
	field: { gap: 7 },
	label: { color: '#344054', fontSize: 14, fontWeight: '700' },
	inputRow: { minHeight: 54, flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#D8DEE9', borderRadius: 14, paddingHorizontal: 16 },
	input: { flex: 1, color: '#182133', fontSize: 16, minHeight: 52 },
	showPassword: { color: '#1476D4', fontWeight: '700', paddingVertical: 12, paddingLeft: 8 },
	error: { color: '#B42318', fontSize: 13 },
	serverError: { color: '#B42318', backgroundColor: '#FEF3F2', borderRadius: 10, padding: 12, lineHeight: 19 },
	primaryButton: { minHeight: 56, borderRadius: 16, backgroundColor: '#1476D4', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
	primaryButtonText: { color: '#FFFFFF', fontSize: 17, fontWeight: '800' },
	pressed: { opacity: 0.8 },
	disabled: { opacity: 0.5 },
	link: { color: '#1476D4', textAlign: 'center', fontWeight: '700', marginTop: 28, padding: 10 },
});
