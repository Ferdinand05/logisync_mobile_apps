# AGENTS.md

High-signal guidance for working in this Ionic Vue + Capacitor mobile app.

## Stack

- **Framework**: Ionic 9 + Vue 3 + TypeScript
- **Build**: Vite 8
- **Mobile**: Capacitor 8 (iOS/Android)
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
```

## Test Structure

- **Unit**: `tests/unit/**/*.spec.{js,ts}` → Vitest (jsdom, globals enabled)
- **E2E**: `tests/e2e/**/*.spec.ts` → Playwright (mobile Chrome Pixel 7 viewport)
  - Playwright auto-starts dev server on `:5173` with 120s timeout
  - CI retries e2e tests 2×, local does not retry

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
- **appId**: `io.ionic.starter` (default, likely needs change for production)
- Native platforms live in `android/` and `ios/` (gitignored)

## Build Output

- Vite outputs to `dist/`
- Uses `@vitejs/plugin-legacy` for older browser support

## Gotchas

- E2E tests expect dev server on port **5173** specifically (`--strictPort` flag used)
- Playwright reuses dev server locally but spawns fresh in CI
- Ionic ESLint rules apply to `.ts/.tsx` files, not Vue SFCs
- `npm run lint` includes e2e typecheck; `npm run build` does not
