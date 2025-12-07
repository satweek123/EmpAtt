# Employee Attendance APK - Setup & Installation

## 📱 Ready-to-Install APK

**Download Link**: [Employee Attendance v1.0](https://github.com/satweek123/EmpAtt/releases/tag/employee-attendance-v1.0)

**File Details**:
- **Filename**: `Employee Attendance.apk`
- **Size**: ~3.1 MB
- **Android Compatibility**: Android 14+ (compiled/target SDK: 35, min SDK: 23)
- **Status**: ✅ Signed and ready for installation

---

## 📥 Installation Methods

### Method 1: Direct Download & Install (Easiest)

1. **Download** the APK from the GitHub release link above
2. **Transfer** the file to your Android device (via USB or cloud storage)
3. **Open** the file with a file manager on your device
4. **Grant** permission to install from unknown sources if prompted
5. **Tap Install** and wait for completion
6. **Launch** the app from your app drawer

### Method 2: Using ADB (Android Debug Bridge)

**Requirements**: ADB installed on your computer, USB debugging enabled on device

```bash
# Connect device via USB
adb install -r "/path/to/Employee Attendance.apk"

# Wait for successful installation message
```

---

## 🔐 Keystore Information (For Future Updates)

To support automatic in-place updates without reinstalling:

### Current Signing Details
- **Keystore Type**: JKS
- **Algorithm**: RSA, 2048-bit
- **Certificate**: Self-signed (suitable for personal use)
- **Validity**: 10 years (36,500 days)

### Production Keystore Setup (Optional - For CI/CD)

To enable GitHub Actions to automatically sign future releases:

1. **Generate Production Keystore** (run locally, keep secure):
   ```bash
   keytool -genkey -v \
     -keystore release-keystore.jks \
     -keyalg RSA \
     -keysize 2048 \
     -validity 36500 \
     -alias release-key \
     -storepass YOUR_KEYSTORE_PASSWORD \
     -keypass YOUR_KEY_PASSWORD
   ```

2. **Add Keystore to GitHub Secrets**:
   - Encode keystore to base64:
     ```bash
     base64 -i release-keystore.jks
     ```
   - Go to **Repository Settings** → **Secrets and variables** → **Actions**
   - Add these secrets:
     - `ANDROID_KEYSTORE_BASE64`: (paste base64 output)
     - `KEYSTORE_PASSWORD`: (your keystore password)
     - `KEY_ALIAS`: `release-key`
     - `KEY_PASSWORD`: (your key password)

3. **Trigger Automated Signing**:
   - Push a tag starting with `release-*`:
     ```bash
     git tag release-v1.1
     git push origin release-v1.1
     ```
   - GitHub Actions will automatically build, sign, and create a release

---

## ✅ Features & Capabilities

- ✅ **Offline Support**: App works without internet connection (PWA + native wrapper)
- ✅ **Data Persistence**: Local storage for attendance records
- ✅ **Native Installation**: Appears as a regular Android app on your device
- ✅ **Adaptive Icon**: Custom launcher icon optimized for Android 14+
- ✅ **Splash Screen**: Custom branding on app launch
- ✅ **No Play Store**: Direct installation without Play Store distribution

---

## 🔄 Update Instructions

### For Same-Signed APKs (Recommended)
1. Download new APK version from releases
2. Use same installation method (direct install or ADB with `-r` flag)
3. Old version automatically replaced ✅ No uninstall needed

### For Different-Signed APKs
1. Uninstall previous version first
2. Install new APK

---

## 🐛 Troubleshooting

### Installation Blocked
- **Issue**: "Install blocked from unknown source"
- **Solution**: Enable "Install unknown apps" in Settings → Apps → Special app access

### ADB Connection Issues
- **Verify**: `adb devices` (shows connected devices)
- **Troubleshoot**: 
  - Reconnect USB cable
  - Enable USB debugging in Developer Options
  - Install ADB drivers if needed

### App Crashes on Launch
- **Check**: Android version (must be 14+)
- **Solution**: Update your device OS or contact support

---

## 📋 Build Information

**Current Build**:
- **Version**: 1.0
- **Version Code**: 1
- **Build Date**: December 7, 2025
- **Signature**: SHA384withRSA (2048-bit RSA key)

**Technology Stack**:
- Frontend: Vite + React 19
- Native Wrapper: Capacitor
- Offline: Service Worker + PWA Manifest
- Build Tool: Gradle (Android)

---

## 🔒 Security Notes

1. **Keystore Security**: Production keystore must be kept private and never committed to git
2. **GitHub Secrets**: Only add keystore credentials to GitHub Secrets (never hardcode)
3. **APK Verification**: Always download APKs from official GitHub releases
4. **API Keys**: Never embed API keys in the APK (use server-side proxies instead)

---

## 📞 Support

For questions or issues:
1. Check the app logs: `adb logcat | grep EmpAtt`
2. Review GitHub issues in the repository
3. Rebuild and test latest version from main branch

---

**Last Updated**: December 7, 2025
