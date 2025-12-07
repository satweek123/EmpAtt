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

Signed release in CI

You can configure GitHub Actions to produce a signed release APK automatically. I added a workflow at `.github/workflows/android-release-sign.yml` which will:

- Build the web assets, assemble the Android release (unsigned)
- Decode a base64-encoded keystore stored in the secret `ANDROID_KEYSTORE_BASE64`
- Use `KEYSTORE_PASSWORD`, `KEY_ALIAS`, and `KEY_PASSWORD` secrets to sign the APK with `apksigner`
- Upload the signed APK as a release asset

Add these secrets to your repository (Settings → Secrets and variables → Actions):

- `ANDROID_KEYSTORE_BASE64`: base64 encoding of your keystore file. Create with:

```bash
base64 -w 0 my-keystore.jks > keystore.base64
```

- `KEYSTORE_PASSWORD`: password for the keystore
- `KEY_ALIAS`: alias name of the key inside the keystore
- `KEY_PASSWORD`: password for the key (may be same as keystore password)

Triggering the workflow:

- Push a git tag matching `release-*` (e.g. `git tag release-1 && git push origin release-1`) or run the workflow manually from Actions → Android Signed Release → Run workflow.

If you do not provide `ANDROID_KEYSTORE_BASE64`, the workflow will still assemble the unsigned release APK and upload it as an artifact for manual signing.
