# Logisync Warehouse Management System

Mobile application for warehouse staff to record and track inventory movements in real-time. Built with Vue 3, Ionic 9, and Capacitor for iOS and Android.

## Overview

Logisync streamlines warehouse operations by replacing manual paper-based tracking with a digital system. Staff can quickly record inbound and outbound goods, perform inventory audits, and access transaction history from the field—all from their smartphone.

**Key Capabilities:**
- Real-time barcode scanning for fast data entry
- Stock inbound and outbound transaction logging
- Inventory count audits (opname) with discrepancy tracking
- Transaction history with filtering and search
- Per-location stock visibility
- Offline-first data layer with online sync

## Tech Stack

| Component | Version | Purpose |
|-----------|---------|---------|
| **Framework** | Vue 3 + TypeScript | UI components and reactivity |
| **Mobile** | Ionic 9 | Native iOS/Android UI library |
| **Runtime** | Capacitor 8 | Web-to-native bridge |
| **Build** | Vite 8 | Fast bundling and dev server |
| **State Management** | TanStack Query v5 | Server state and caching |
| **HTTP Client** | Axios | API communication |
| **Font** | Inter Variable | All typography |
| **Testing** | Vitest + Playwright | Unit and e2e tests |

## Getting Started

### Prerequisites

- Node.js 22+ and npm 12+
- Android SDK (for native Android builds)
- Xcode 15+ (for iOS builds on macOS)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd logisync_mobileapp

# Install dependencies
npm install

# Install Playwright browsers (once per machine)
npx playwright install chromium
```

### Development

Start the local dev server:

```bash
npm run dev
# Server runs at http://localhost:5173
```

Access from your phone on the same network:
```
http://<your-pc-ip>:5173
```

### Build & Test

```bash
# Run all checks (lint + type + format + tests)
npm run lint
npm run build
npm run test

# Individual commands
npm run test:unit              # Unit tests only
npm run test:e2e              # E2E tests (spawns dev server)
npm run lint:fix              # Auto-fix linting and formatting
```

## Project Structure

```
src/
├── api/                       # API layer
│   └── features/              # Per-feature API modules
│       ├── auth/              # Login, user session
│       ├── transaction/       # Stock in/out records
│       ├── audit/             # Opname (inventory counts)
│       ├── location/          # Warehouse locations
│       └── item/              # Product lookup by SKU
├── components/                # Reusable Vue components
├── composables/               # Vue composition functions
├── router/                    # Route definitions
├── theme/                     # CSS variables, light theme
├── utils/                     # Helpers (storage, scanner, errors, etc.)
└── views/                     # Page components
    ├── auth/                  # Login flow
    ├── dashboard/             # Home, profile
    └── warehouse/             # Stock, transactions, audits, history

tests/
├── unit/                      # Vitest specs
└── e2e/                       # Playwright specs

android/                       # Native Android project (Gradle)
public/                        # Static assets (images, fonts)
assets/                        # Native asset sources (icons, splash screens)
```

## Key Features

### 1. Stock Transactions
Record inbound and outbound goods with:
- SKU (product code) via manual entry or barcode scan
- Quantity
- Warehouse location
- Reference number (PO, invoice, etc.)
- Optional notes

### 2. Inventory Audits (Opname)
Count stock in real-time with:
- Per-location or full-warehouse scope
- Item-by-item count vs. system quantity
- Immediate discrepancy flagging
- Audit session tracking

### 3. Transaction History
Browse and filter all movements by:
- Transaction type (inbound/outbound/audit)
- Date range
- Location
- Infinite scroll pagination

### 4. Location Management
View available warehouse locations and their stock levels.

### 5. Barcode Scanning
Native barcode reader (Android/iOS) for fast SKU entry. Falls back to manual text input on web.

## Architecture

### Authentication Flow
1. User logs in with email/password
2. API returns JWT token + user info
3. Token stored securely (device keychain or browser localStorage)
4. Bearer token sent on all API requests
5. 401 response clears session and returns to login

### Data Layer
- **TanStack Query** caches API responses and manages async state
- **Axios** interceptor adds auth headers and handles 401 errors
- **Storage abstraction** (`src/utils/storage.ts`) switches between:
  - Web: `localStorage`
  - Native: `@capacitor/preferences` (encrypted)

### UI Structure
- **Tabs Layout** (`TabsLayout.vue`): 4 bottom-tab navigation shell
  - Beranda (Home)
  - Opname (Audits)
  - Transaksi (Transactions)
  - Riwayat (History)
- **Stack Routes**: Profile, Stock locations, location detail, audit detail (outside tabs)
- **Header** (`AppHeader.vue`): Logo, wordmark, page title, profile button

## Configuration

### Environment Variables

Create `.env` (development) or `.env.production` as needed:

```env
VITE_API_BASE_URL=https://api-logisync.3.25.191.99.nip.io/api
```

Default is used if not set.

### Branding & Theme

Update in `src/theme/variables.css`:
- **Primary accent**: `--logisync-primary` (#2563EB)
- **Success**: `--logisync-success` (#059669)
- **Warning**: `--logisync-warning` (#D97706)
- **Danger**: `--logisync-danger` (#DC2626)
- **Typography**: `--ion-font-family` (Inter Variable)

## Building for Native

### Android Debug APK

```bash
cd android
./gradlew assembleDebug
# Output: app/build/outputs/apk/debug/app-debug.apk
```

### Android Release APK

Requires signing certificate:

```bash
./gradlew assembleRelease
```

### Sync Web Changes to Native

After updating web code:

```bash
npm run build
npx cap sync android
```

## Deployment

### Web/PWA
Deploy the `dist/` folder to any static host (Vercel, Netlify, etc.).

### Android
Build the APK and distribute via:
- Google Play Store
- Internal enterprise distribution
- Direct APK sharing

### iOS
Requires macOS and Xcode. Build via:

```bash
npm run build
npx cap add ios
npx cap sync ios
# Open ios/App/App.xcworkspace in Xcode
```

## API Integration

The app communicates with a Logisync warehouse API. Endpoints are defined in `src/api/features/`.

**Base URL:** `https://api-logisync.3.25.191.99.nip.io/api`

**Authentication:** Bearer token in `Authorization` header

**Response Format:** Inconsistent across endpoints; normalization handled in `src/api/normalize.ts`

See `docs/api-docs.json` for the full OpenAPI spec.

## Testing

### Unit Tests

```bash
npm run test:unit
# Watch mode
npm run test:unit:watch
```

### E2E Tests

Playwright tests run against a live dev server:

```bash
npm run test:e2e
```

Tests validate:
- Authentication flow
- Page layouts at multiple viewport sizes (320px, 360px, 390px)
- Splash screen display
- Navigation between tabs

## Performance

- **Build time**: ~50–60 seconds (includes legacy browser polyfills)
- **Web bundle**: ~1.2 MB (gzipped ~250 KB)
- **APK size**: ~51 MB (includes all Capacitor plugins and web assets)

Legacy browser support via `@vitejs/plugin-legacy`.

## Known Limitations

- **Barcode scanning** only works in native builds (Android/iOS). Web shows a fallback UI.
- **Offline mode** not implemented; internet connection required.
- **Dark mode** not available; light theme only.
- **Multi-language** not implemented; Indonesian only.

## Troubleshooting

### Dev Server Not Accessible
- Ensure PC and phone are on the same WiFi network
- Replace `localhost` with your PC's IP address
- Check firewall isn't blocking port 5173

### Android Build Fails
- Verify `android/local.properties` points to your Android SDK
- Run `./gradlew clean` and rebuild
- Update build tools: `SDK Manager` → Android 36

### Barcode Scanner Not Working
- Only works in native APK/IPA, not in browser
- Requires camera permission on device
- Check `android/variables.gradle` has `minSdkVersion = 26`

## Contributing

1. Create a feature branch from `main`
2. Make changes and run `npm run lint:fix`
3. Commit with clear messages
4. Push and open a pull request

## License

Proprietary. All rights reserved.

## Support

For issues or questions:
- Check `PRODUCT.md` for product scope and decisions
- Review `AGENTS.md` for development setup and gotchas
- Read `CONTEXT.md` for UI/UX guidelines and stack details
