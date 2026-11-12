// Expo app configuration.
//
// This project builds with EAS (cloud builds) only. EAS generates the native
// `ios/` and `android/` projects on its own macOS builders during
// `eas build`, so neither native folder needs to exist on the Windows
// checkout and neither is committed.
//
// The `scheme` is the important one: `expo-linking` (and therefore
// `expo-router` deep links) throws at runtime if no scheme is declared in the
// build-time config. It must stay in sync with the `gamifrench` intent-filter
// in android/app/src/main/AndroidManifest.xml.

/** @type {import('expo/config').ExpoConfig} */
module.exports = {
  name: 'GamiFrench',
  slug: 'gamifrench',

  // EAS project link (@rogerskie09/gamifrench). Required for `eas build` /
  // `eas update` to know which project this app belongs to.
  extra: {
    eas: {
      projectId: 'fc8581aa-6702-41b6-ade7-b427a98c6962',
    },
  },

  // Deep-link scheme. Keep in sync with AndroidManifest.xml and Info.plist.
  scheme: 'gamifrench',

  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',

  // Matches android/app/src/main/res/values/strings.xml
  // (expo_system_ui_user_interface_style = automatic).
  userInterfaceStyle: 'automatic',

  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    // Matches android splashscreen_background.
    backgroundColor: '#208AEF',
  },

  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.erdao.gamifrench',
    infoPlist: {
      NSMicrophoneUsageDescription:
        'Allow GamiFrench to use the microphone to check your spoken French.',
      NSSpeechRecognitionUsageDescription:
        'Allow GamiFrench to recognize your spoken French.',
      ITSAppUsesNonExemptEncryption: false,
    },
  },

  android: {
    package: 'com.erdao.gamifrench',
    // Matches android/app/src/main/res/drawable/ic_launcher_background.xml.
    adaptiveIcon: {
      foreground: './assets/images/android-icon-foreground.png',
      background: './assets/images/android-icon-background.png',
      // No monochrome (Android 13 themed) icon: a photo has no clean one-colour
      // silhouette, and the old file was still the Expo logo.
    },
    edgeToEdgeEnabled: true,
  },

  web: {
    favicon: './assets/images/favicon.png',
    bundler: 'metro',
    output: 'single',
  },

  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#208AEF',
      },
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
      },
    ],
    [
      // Local daily reminders (scheduled on the device, no push server).
      'expo-notifications',
      {
        color: '#208AEF',
      },
    ],
    [
      'expo-speech-recognition',
      {
        microphonePermission:
          'Allow GamiFrench to use the microphone to check your spoken French.',
        speechRecognitionPermission:
          'Allow GamiFrench to recognize your spoken French.',
      },
    ],
  ],

  experiments: {
    typedRoutes: true,
  },
};
