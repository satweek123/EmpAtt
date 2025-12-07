Building an Android APK (debug) using Capacitor

This project includes Capacitor configuration (`capacitor.config.json`) which wraps the built web app into a native Android project.

Two ways to get an APK:

1) Use GitHub Actions (recommended if you can't build locally)

- Push your branch to `main` (or trigger the workflow manually via Actions → Android APK Build).
- The workflow will run `npm ci`, `npm run build`, then run Capacitor to add/copy the Android project and run Gradle to produce a debug APK.
- The workflow uploads the `app-debug.apk` as an artifact you can download from the workflow run.

2) Build locally (requires Android Studio / SDK)

- Prerequisites: Java 17, Android SDK, Android Studio (or command line tools), Node.js
- Commands:

```bash
npm install
npm run build
npx @capacitor/cli@latest add android
npx @capacitor/cli@latest copy android
# Open Android Studio or build with Gradle
cd android
./gradlew assembleDebug
# APK will be at android/app/build/outputs/apk/debug/app-debug.apk
```

Notes:
- The workflow builds a debug APK (unsigned) for testing/installing on devices. For Play Store distribution you must create a release build, sign it, and follow Play Store requirements.
- If you need an automatic signed release build in CI, provide your keystore and keys as GitHub Secrets and update the `android/gradle.properties` and `build.gradle` signing config accordingly.
