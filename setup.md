# Balwa Car Cool – Developer Setup Guide

This document explains how to set up and run the **Balwa Car Cool** mobile application locally.

---

## 1. System Requirements

### Mandatory
- Node.js **>= 18.x (LTS recommended)**
- npm **>= 9.x**
- Git

> ⚠️ Node versions below 18 will NOT work (Expo requires `ReadableStream`).

Verify versions:
```bash
node -v
npm -v
```

---

## 2. Tech Stack Overview

- **Framework**: React Native (Expo)
- **Navigation**: Expo Router
- **Authentication**: Supabase Auth
- **Storage**: AsyncStorage (managed by Supabase)
- **Icons**: @expo/vector-icons

---

## 3. Clone the Repository

```bash
git clone https://github.com/PrimeVexTechnologies/Balwa-Car-Cool-App.git
cd BalwaCarCool
```

---

## 4. Install Dependencies

```bash
npm install
```

If dependency conflicts occur:
```bash
npm install --legacy-peer-deps
```

---

## 5. Supabase Auth Setup (Required)

This app uses **one admin user only** (no signup flow).

   ```
   Email: admin@gmail.com
   Password: admin
   ```

---

## 6. Start Development Server

```bash
npx expo start
```

---

## 7. Run on Device

### Android (Recommended)
- Install **Expo Go** from Play Store
- Scan the QR code

### Android Emulator
- Ensure emulator is running
- Press `a` in the Expo terminal

### iOS Simulator (Mac only)
- Press `i` in the Expo terminal

---

## 8. Common Fixes

### Clear Expo cache
```bash
npx expo start -c
```

### Node issues
Ensure Node version is **18 or higher**:
```bash
node -v
```

---

## 9. Application Flow

```
Login (Supabase Auth)
  ↓
Dashboard
  ├─ Create Bill
  ├─ Service History
  └─ Logout
```

---

## 10. Not Used (By Design)

- react-router-dom
- vite
- HTML / CSS / DOM APIs
- Tailwind CSS

---

## 11. Setup Complete

The project is now ready for development 🚀
