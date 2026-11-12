# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Play Store release (Android App Bundle via EAS)

The `android/` folder is generated (Continuous Native Generation) and gitignored.
**Build the Play Store `.aab` with EAS Build — never upload a locally built
artifact**: a local `gradlew bundleRelease` is signed with the debug keystore
(the template's release build type falls back to `signingConfigs.debug`), which
Google Play must never see. EAS injects the managed upload keystore instead.

### One-time setup

1. Log in to EAS:

   ```bash
   npx eas login
   ```

2. Create the Android upload keystore and **back it up** (losing it can lock
   you out of Play updates; also enroll in Play App Signing):

   ```bash
   npx eas credentials
   # → Android → Set up new keystore → save the downloaded credentials
   ```

3. Configure environment variables on EAS. The local `.env` file is gitignored
   and **is not uploaded to cloud builds**, so values must exist as EAS
   environment variables in the `production` environment:

   ```bash
   # Required: online transcription key (falls back to offline ASR when absent)
   npx eas env:set production --name EXPO_PUBLIC_GROQ_API_KEY --value <your-groq-key> --visibility sensitive

   # Optional: explicit API base URL (already set in eas.json and hardcoded
   # as a fallback in src/services/apiClient.ts)
   npx eas env:set production --name EXPO_PUBLIC_API_URL --value https://gami-backend-6pc9.onrender.com/api/v1 --visibility plaintext
   ```

   > ⚠️ Any `EXPO_PUBLIC_*` value is compiled into the JS bundle and is
   > extractable from the `.aab`. The Groq key is visible to anyone who
   > downloads the app — long-term, proxy transcription through the
   > GamiFrench backend instead of shipping the key client-side.

4. For `eas submit`, create a Google Play Console service account with API
   access and download its JSON key (you will be prompted for the path on
   first submit, or set `submit.production.android.serviceAccountKeyPath`
   in `eas.json`).

### Each release

1. Bump `version` in `app.config.js` (becomes `versionName`; `versionCode`
   auto-increments because `eas.json` uses `appVersionSource: "remote"`).
2. Build the App Bundle:

   ```bash
   npx eas build -p android --profile production
   ```

3. Submit it (or upload the downloaded `.aab` manually under
   Play Console → Testing → Production):

   ```bash
   npx eas submit -p android --profile production
   ```

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
