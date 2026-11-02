# StaffifyMOB — Enterprise Android Mobile Companion Suite

**StaffifyMOB** (`com.staffify.mob`) is the official Android APK mobile companion application for the Staffify Workforce Suite. Engineered with Capacitor 6, React 19, Tailwind CSS, Lucide React icons, and the Atlassian Enterprise Design System, StaffifyMOB gives employees and managers instant mobile access to clock-in swipes, leave balances, payslips, approvals, and digital ID badges.

---

## 1. How to Get & Install the Android APK (`.apk`)

Because you don't need Android development software installed locally, StaffifyMOB is set up with **automated cloud builds via GitHub Actions**:

### Option A: Download from GitHub Actions (Zero Setup Required)
1. Push your changes or trigger the workflow on GitHub.
2. Go to the **Actions** tab in your GitHub repository: `Build StaffifyMOB Android APK`.
3. Select the latest successful workflow run.
4. Scroll to the **Artifacts** section at the bottom.
5. Click **StaffifyMOB-debug-apk** to download the `StaffifyMOB-debug.apk` file.
6. Transfer the `.apk` file to your Android phone (via Google Drive, USB cable, or WhatsApp) and tap to install.

### Option B: Local Android Studio Build (For Developers)
If you install Android Studio and the Android SDK on your workstation:
```bash
cd staffify-mob
npm run build
npx cap sync android
npx cap open android
```
Once Android Studio opens, click **Build > Build Bundle(s) / APK(s) > Build APK(s)** to generate `app-debug.apk`.

---

## 2. Fast Local Development & Mobile Preview

You can preview and test StaffifyMOB on your computer or any phone connected to the same Wi-Fi network:

```bash
cd staffify-mob
npm run dev -- --host 0.0.0.0 --port 5174
```

- **Desktop Browser**: Open `http://localhost:5174` (press `F12` and toggle device toolbar to view as iPhone 14 / Pixel 7).
- **Phone Browser on Wi-Fi**: Open `http://<YOUR_COMPUTER_IP>:5174`.

---

## 3. Key Mobile Features & Architecture

| Feature | Description |
|---|---|
| **GPS Geofence Radar Swipes** | Computes live distance to designated corporate geofence perimeter (e.g. Bangalore HQ Indiranagar, 200m radius). |
| **Tactile Hold-to-Punch** | Prevents accidental swipes with a smooth 1.2-second circular SVG progress fill and native haptic vibration. |
| **Leave Quotas & Comp-Off Claims** | Real-time quota balance meters (CL, SL, EL, Comp-Off) and statutory 90-day weekend overtime claim submissions. |
| **Downloadable Payslips** | Hero Net Take-Home salary breakdown, statutory EPF/ESIC/PT/TDS deduction itemization, and bank UTR badges. |
| **Manager Approvals Deck** | 1-tap fast decision cards to approve or reject pending leaves, comp-off grants, and punch regularizations. |
| **Digital Smart ID & Document Vault** | Official company NFC/QR badge simulation, Aadhaar/PAN/UAN cards, and appointment letters. |
| **Instant Demo Role Switchers** | 1-tap quick authentication buttons for Admin, Manager, and Employee profiles. |

---

## 4. Technical Specifications

- **Package Name / App ID**: `com.staffify.mob`
- **Application Label**: `StaffifyMOB`
- **Native Platform**: Android (SDK 34+ / Android 14 compatible)
- **Capacitor Plugins**:
  - `@capacitor/core`: Native runtime bridge
  - `@capacitor/android`: Native Android project harness
  - `@capacitor/geolocation`: High-accuracy GPS coordinates for geofence validation
  - `@capacitor/haptics`: Tactile feedback on hold-to-punch and button taps
  - `@capacitor/status-bar`: Styled mobile top bar matching `#0052CC` brand blue
  - `@capacitor/preferences`: Local secure key-value and offline swipe queuing
- **Design Standard**: Atlassian Enterprise Design System with zero Unicode emojis.
