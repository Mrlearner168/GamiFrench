import { openBrowserAsync, WebBrowserPresentationStyle } from 'expo-web-browser';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

const ICON_SIZE = 20;

/**
 * Opens the GamiFrench Admin Dashboard in an in-app browser.
 *
 * NOTE: The admin dashboard is a separate standalone web app, not a screen
 * inside the Expo app, so we can't use `Link` to navigate to it. Instead we
 * open it in the system browser via `openBrowserAsync`.
 */
export function AdminDashboardLink({
    disabled,
    marginTop = 20,
}: {
    disabled: boolean;
    marginTop?: number;
}) {
    return (
        <View style={{ marginTop }}>
            <TouchableOpacity
                style={styles.button}
                disabled={disabled}
                onPress={async () => {
                    await openBrowserAsync('https://gamiadmindash.vercel.app/', {
                        presentationStyle: WebBrowserPresentationStyle.AUTOMATIC,
                    });
                }}
                accessibilityRole="link"
                accessibilityState={{ disabled }}
                accessibilityLabel="Go to the GamiFrench admin dashboard"
            >
                <Svg
                    width={ICON_SIZE}
                    height={ICON_SIZE}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    accessibilityLabel="Admin dashboard icon"
                >
                    <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </Svg>
                <Text style={styles.text}>Go to admin dashboard</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    button: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 10,
        backgroundColor: '#1476D4',
        borderRadius: 16,
        minHeight: 58,
        paddingHorizontal: 24,
        shadowColor: '#1476D4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 3,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 15,
        fontWeight: '800',
    },
});

