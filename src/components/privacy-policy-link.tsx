import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { StyleSheet, Text } from 'react-native';

/**
 * Single source of truth for the privacy policy URL. This doubles as the link
 * submitted in the Play Console ("App content › Privacy policy"), so it must
 * stay live and public: https://mrlearner168.github.io/gamifrench-privacy/
 * (repository: github.com/Mrlearner168/gamifrench-privacy, served via GitHub Pages).
 */
export const PRIVACY_POLICY_URL = 'https://mrlearner168.github.io/gamifrench-privacy/';

/**
 * Open the privacy policy in the in-app browser. Shared by the Settings row
 * and the auth screen footers, so every entry point leads to the same page.
 */
export async function openPrivacyPolicy() {
    await openBrowserAsync(PRIVACY_POLICY_URL, {
        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
    });
}

/**
 * Small "Privacy Policy" text link, styled like AdminDashboardLink. Google
 * Play requires the policy to be reachable inside the app, so it also has to
 * be visible before sign-in — the login/register footers are pre-auth, and
 * Settings covers signed-in users.
 */
export function PrivacyPolicyLink({ disabled }: { disabled?: boolean }) {
    return (
        <Text
            style={[styles.text, disabled && styles.disabled]}
            disabled={disabled}
            onPress={openPrivacyPolicy}
            accessibilityRole="link"
            accessibilityState={{ disabled }}
            accessibilityLabel="Read the GamiFrench privacy policy"
            suppressHighlighting={false}
        >
            Privacy Policy
        </Text>
    );
}

const styles = StyleSheet.create({
    text: {
        color: '#64748B',
        fontWeight: '600',
        fontSize: 14,
        paddingVertical: 12,
        paddingHorizontal: 6,
        alignSelf: 'center',
    },
    disabled: {
        opacity: 0.5,
    },
});
