# Employee Attendance App - Troubleshooting Guide

## Issue: Blank White Page on App Launch

### Root Causes & Solutions

#### 1. **Network Issues (Most Common)**
The app needs internet to load React from CDN via importmap. If network is unavailable:

**Solution:** 
- Ensure device has internet connection
- Try uninstalling and reinstalling the app
- Restart the device

#### 2. **Java/JavaScript Runtime Error**
There may be an exception preventing the app from rendering.

**How to Check:**
```bash
# On your device connected to computer (with ADB):
adb logcat | grep "EmpAtt\|React\|Error"
```

**Or using Chrome DevTools:**
1. Connect device to computer via USB
2. Open Chrome on desktop: `chrome://inspect`
3. Find your device and click "Inspect"
4. Go to Console tab
5. Look for error messages (red text)

#### 3. **Missing Web Assets**
Web build files not properly included in APK.

**Check:**
```bash
unzip -l "Employee Attendance.apk" | grep -E "index|assets|manifest"
```

Should show:
- `assets/index-*.js` (220+ KB)
- `index.html`
- `manifest.json`
- `sw.js`

#### 4. **Capacitor Configuration Issue**
The app might not be loading the web content correctly.

**Check `/workspaces/EmpAtt/capacitor.config.json`:**
```json
{
  "appId": "com.empatt.app",
  "appName": "Employee Attendance Tracker",
  "webDir": "dist",  // Must point to dist folder with built assets
  "bundledWebRuntime": false
}
```

---

## Latest Build (v1.3) - Debugging Version

This version includes console logging to help diagnose issues:

**What's logged:**
- "App loading..." - When entry point starts
- "Root element found..." - When React mount point is found
- "React app mounted successfully" - When app renders
- Any errors or unhandled rejections

**To see logs:**

```bash
# Real device via ADB:
adb install -r "Employee Attendance.apk"
adb logcat -s "Console" &  # Monitor console
# Open app and watch for messages

# Android Studio emulator:
Logcat → Filter by "React" or "Employee"
```

---

## Manual Testing Checklist

- [ ] APK downloads without errors
- [ ] APK installs on device (no "app not installed" error)
- [ ] App icon shows as custom "EA" icon
- [ ] App launches (doesn't crash immediately)
- [ ] Page displays (not blank white)
- [ ] UI elements visible (buttons, inputs, etc.)
- [ ] Can interact with app (click buttons, enter data)
- [ ] Data persists after app restart
- [ ] App works offline

---

## Version History

| Version | Date | Status | Issue |
|---------|------|--------|-------|
| 1.3 | Dec 7 | Debug Build | Blank page - debugging enabled |
| 1.2 | Dec 7 | Fixed | React bundle fixed, custom icons |
| 1.1 | Dec 7 | Fixed | Proper apksigner, custom PNG icons |
| 1.0-fixed | Dec 7 | Fixed | Target SDK changed to 34 |

---

## If Still Blank After v1.3

1. **Share console logs:**
   ```bash
   adb logcat > device_logs.txt
   # Use app for 30 seconds
   # Share the log file
   ```

2. **Possible causes to check:**
   - Device storage full → Clear cache
   - Chrome/WebView outdated → Update in Play Store
   - Memory issues → Restart device
   - File permissions → Uninstall & reinstall

3. **Try clear data:**
   ```bash
   adb shell pm clear com.empatt.app
   # Then open app again
   ```

---

## Working Solution Path

If app still doesn't work, try this sequence:

1. Install **v1.3** from releases
2. Check console for errors (see "Latest Build" section)
3. Share error messages or logs
4. We can then:
   - Bundle React locally instead of CDN
   - Create a simpler test version
   - Debug specific component issues

---

## Contact

Report issues with:
- Device OS version (Android 14, etc.)
- Console error messages
- Device logs (adb logcat output)
- Steps to reproduce

