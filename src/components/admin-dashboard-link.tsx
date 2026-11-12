import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { StyleSheet, Text } from 'react-native';

/**
 * Small "Admin dashboard" text link (like a "Forgot password?" link) that opens
 * the GamiFrench Admin Dashboard in an in-app browser.
 *
 * NOTE: The admin dashboard is a separate standalone web app, not a screen
 * inside the Expo app, so we can't use `Link` to navigate to it. Instead we
 * open it in the system browser via `openBrowserAsync`.
 */
export function AdminDashboardLink({ disabled }: { disabled: boolean }) {
    return (
        <Text
            style={[styles.text, disabled && styles.disabled]}
            disabled={disabled}
            onPress={async () => {
                await openBrowserAsync('https://gamiadmindash.vercel.app/', {
                    presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
                });
            }}
            accessibilityRole="link"
            accessibilityState={{ disabled }}
            accessibilityLabel="Go to the GamiFrench admin dashboard"
            suppressHighlighting={false}
        >
            Admin dashboard
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
    },
    disabled: {
        opacity: 0.5,
    },
});
