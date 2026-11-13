# AGENTS.md

High-signal guidance for working in this Ionic Vue + Capacitor mobile app.

## Stack

- **Framework**: Ionic 9 + Vue 3 + TypeScript
- **Build**: Vite 8
- **Mobile**: Capacitor 8 (iOS/Android)
- **Font**: Inter Variable, self-hosted (`@fontsource-variable/inter`)
- **State**: TanStack Query (Vue Query)
- **HTTP**: Axios
- **Tests**: Vitest (unit), Playwright (e2e)

## Commands

**Order matters for full verification:**

```bash
npm run lint         # eslint + typecheck:e2e + prettier --check
npm run build        # vue-tsc THEN vite build (typechecks before building)
npm run test         # runs test:unit + test:e2e sequentially
```

**Single-purpose commands:**

```bash
npm run dev                 # dev server, port auto-assigned
npm run test:unit           # vitest run (tests/unit/**/*.spec.{js,ts})
npm run test:unit:watch     # vitest watch mode
npm run test:e2e            # playwright (tests/e2e/*, spawns dev server on :5173)
npm run eslint              # eslint with --max-warnings 0
npm run typecheck:e2e       # tsc -p tsconfig.e2e.json (separate from main build)
npm run lint:fix            # eslint --fix + prettier --write
npx cap sync android        # copy the web build and plugins into android/
npx capacitor-assets generate --android  # rebuild native icons and splash from assets/
```

## Test Structure

- **Unit**: `tests/unit/**/*.spec.{js,ts}` → Vitest (jsdom, globals enabled)
- **E2E**: `tests/e2e/**/*.spec.ts` → Playwright (mobile Chrome Pixel 7 viewport)
  - Playwright auto-starts dev server on `:5173` with 120s timeout
  - CI retries e2e tests 2×, local does not retry

## Architecture

- **API base URL**: `https://api-logisync.3.25.191.99.nip.io/api` (override with `VITE_API_BASE_URL`). Full OpenAPI spec lives in `docs/api-docs.json` — read it before adding a feature; do not guess endpoints.
- **API layer**: per-feature folders under `src/api/features/<feature>/` with `types.ts`, `<feature>.queries.ts` (GET) and `<feature>.mutate.ts` (POST/PATCH/DELETE). Features: `auth`, `transaction`, `audit`, `location`, `item`.
- **Response shapes are inconsistent**: `/transactions`, `/locations`, `/items/lookup` return empty schemas in `docs/api-docs.json`. Always normalise via `src/api/normalize.ts` (`unwrapItem`, `unwrapCollection`, `nextPageParam`) instead of assuming `response.data.data`.
- **Auth session**: `src/composables/useAuth.ts` holds the reactive token/user; persistence is abstracted in `src/utils/storage.ts` (localStorage on web, `@capacitor/preferences` on native). `main.ts` calls `hydrate()` before mounting, and `router.beforeEach` blocks routes without a token.
- **401 handling**: the Axios response interceptor in `src/api/client.ts` clears the session and redirects to `login` on any 401.
- **Navigation**: 4 bottom tabs live in `src/views/TabsLayout.vue` (`/home`, `/opname`, `/transaction`, `/history`). Stack routes outside the tab shell: `/profile`, `/stock`, `/stock/:locationId`, `/opname/:auditSessionId`.
- **Views are single-word files** (`Home.vue`, `Login.vue`, ...) per CONTEXT.md, which is why `vue/multi-word-component-names` is disabled for `src/views/**`.
- **Typography**: Inter is imported in `src/main.ts` and exposed as `--ion-font-family` in `src/theme/variables.css`. Do not add a second font family or a Google Fonts link.

## Path Alias

`@/*` → `./src/*` (configured in both `tsconfig.json` and `vite.config.ts`)

## Lint & Format

- ESLint: flat config (`eslint.config.js`), uses `@ionic/eslint-config` for `.ts/.tsx` only
- Vue SFCs get Vue + TypeScript rules but NOT Ionic rules
- Prettier: uses `@ionic/prettier-config` via package.json
- **Ignored paths**: `dist/`, `android/`, `ios/`, `playwright-report/`, `test-results/`, `blob-report/`
- `no-console` and `no-debugger` warn in production, off in dev
- `@typescript-eslint/no-explicit-any`: disabled project-wide

## Type Checking

- **Build**: `vue-tsc` runs before `vite build` (blocks on type errors)
- **E2E types**: separate `tsconfig.e2e.json`, checked via `npm run typecheck:e2e` (part of `npm run lint`)
- `skipLibCheck: true`, `noEmit: true` in main tsconfig

## Capacitor

- **webDir**: `dist` (Capacitor serves from Vite build output)
- **appId**: `com.logisync.warehouse`
- Native projects live in `android/` and `ios/` and are tracked in git. The generated `.gitignore` files inside them exclude build output only.
- **Native icon and splash sources**: `assets/` (`icon-only.png`, `icon-foreground.png`, `icon-background.png`, `splash.png`). Custom Mode requires `splash.png` at least 2732×2732 and icon layers at least 1024×1024.
- **Splash**: `@capacitor/splash-screen` is configured in `capacitor.config.ts` with `launchAutoHide: false`. `src/main.ts` hides it after the app mounts. The web boot splash is `#boot-splash` in `index.html` and is removed by `main.ts`.
- After changing `assets/`, run `npx capacitor-assets generate --android` and then `npx cap sync android`.

## Build Output

- Vite outputs to `dist/`
- Uses `@vitejs/plugin-legacy` for older browser support

## Gotchas

- E2E tests expect dev server on port **5173** specifically (`--strictPort` flag used)
- Playwright reuses dev server locally but spawns fresh in CI
- Run `npx playwright install chromium` once before the first `test:e2e`; browsers are not bundled
- Ionic ESLint rules apply to `.ts/.tsx` files, not Vue SFCs
- `npm run lint` includes e2e typecheck; `npm run build` does not
- `npm run build` is slow (~45s) because `@vitejs/plugin-legacy` post-processes every chunk
- Barcode scanning (`src/utils/scanner.ts`) only works in a native Capacitor build; there is no web fallback
- Android uses `minSdkVersion = 26` in `android/variables.gradle` for `@capacitor/barcode-scanner`; iOS needs an `NSCameraUsageDescription` in `Info.plist`
- Theme is light-only by design: `src/theme/variables.css` sets the palette and `main.ts` must not re-import the dark palette
