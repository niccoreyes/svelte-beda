# svelte-beda Agent Guide

## Overview

`svelte-beda` is a SvelteKit-based FHIR EMR frontend application. It uses Svelte 5 runes, Tailwind CSS v4, and communicates with a FHIR R4b server.

## Build Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (Vite) |
| `npm run build` | Create production build |
| `npm run preview` | Preview production build locally |
| `npm run check` | Run SvelteKit sync + `svelte-check` + TypeScript type checking |
| `npm run check:watch` | Run type checking in watch mode |
| `npm run test` | Run unit tests (Vitest) |
| `npm run test:watch` | Run unit tests in watch mode |

## Testing Commands

| Command | Description |
|---------|-------------|
| `npm run test` | Unit tests via Vitest + jsdom + Testing Library Svelte |
| `npm run test:integration` | Integration tests with Docker Compose + HAPI FHIR |
| `npm run test:browser` | Browser smoke tests via agent-browser |
| `npm run test:browser:screenshot` | Browser tests with screenshots |
| `npm run test:browser:debug` | Browser tests with debug mode (keeps session open) |
| `npm run browser:debug` | Quick browser debug snapshot of any page |
| `npx playwright test` | Run E2E tests (Playwright) |
| `npx playwright test --ui` | Run E2E tests with UI mode |

## Browser Testing & Debug

The project includes browser automation scripts powered by **agent-browser**:

### Automated Smoke Tests
```bash
npm run test:browser                  # Test all key pages
npm run test:browser -- --dark        # Test in dark mode
npm run test:browser -- /patients      # Test specific page
npm run test:browser:screenshot       # Capture screenshots of all pages
```

### Manual Browser Debug
```bash
# Quick debug snapshot of the running app
npm run browser:debug

# Or debug a specific URL
./scripts/browser-debug.sh http://localhost:5173/patients
```

### Using agent-browser directly
```bash
# Requires: npm i -g agent-browser && agent-browser install
agent-browser open http://localhost:5173
agent-browser snapshot -i              # See interactive elements
agent-browser screenshot page.png       # Take screenshot
agent-browser click @e1                 # Click element by ref
agent-browser eval "document.title"    # Run JS in page context
agent-browser close --all              # Clean up
```

## Other Commands

| Command | Description |
|---------|-------------|
| `npm run prepare` | SvelteKit sync (runs automatically on install) |
| `npm run storybook` | Start Storybook dev server (port 6006) |
| `npm run build-storybook` | Build Storybook for deployment |
| `npm run i18n:extract` | Extract translation keys from source |
| `npm run i18n:compile` | Compile and validate locale files |

### Docker
```bash
docker-compose up -d    # Start app + HAPI FHIR + PostgreSQL
docker-compose down      # Stop all services
```

### Storybook
Storybook is configured with Svelte framework, Vite builder, and a theme decorator that injects CSS variables. Run `npm run storybook` to start.

### i18n
The app uses `svelte-i18n` with locale files in `src/lib/i18n/locale/`. Supported locales: `en`, `es`, `ru`, `de`. The setup function is `setupI18n()` imported from `$lib/i18n` and should be called during app initialization.

## Development Workflow

1. **Start the dev server**: `npm run dev`
2. **Before committing**: run `npm run check` and `npm run test`
3. **Type checking**: `svelte-check` validates Svelte files + TypeScript. Keep this at 0 errors.
4. **Testing strategy**:
   - Unit tests: Vitest + jsdom for utilities and simple components
   - Component tests: `@testing-library/svelte` + Vitest
   - Integration tests: Docker Compose + HAPI FHIR + Vitest
   - Browser smoke tests: agent-browser for visual/functional verification
   - E2E tests: Playwright in the `e2e/` directory (config: `playwright.config.ts`)

## Key Architecture Decisions

### State Management
- **RemoteData pattern**: All async data is wrapped in a `RemoteData<D, E>` type (`notAsked | loading | success | failure`) defined in `src/lib/state/remoteData.ts`.
- **ServiceState**: `createServiceState` in `src/lib/state/serviceState.svelte.ts` wraps RemoteData with auto-reload capabilities via Svelte 5 runes.
- **Shared state**: `fhirBaseURLState`, `currentLocaleState`, and other shared reactive state live in `src/lib/state/sharedState.svelte.ts`.

### FHIR Layer
- **Client** (`src/lib/fhir/client.ts`): Direct FHIR HTTP client using `fetch`. Handles CRUD, search, batch, ValueSet expansion, upload/download URLs.
- **Remote** (`src/lib/fhir/remote.ts`): Mirror of the client with a different naming convention (legacy compatibility).
- **Search params**: `buildSearchParams`, `serializeDateFilter`, `serializeSortParam` in `src/lib/utils/searchParams.ts`.

### UI Components
- Components are in `src/lib/components/`. Re-exported from `src/lib/components/index.ts`.
- `SearchBar` supports multiple filter types: `STRING`, `DATE`, `SINGLEDATE`, `REFERENCE`, `CHOICE`, `SOLIDCHOICE`, `SPLITSTRING`.
- `SearchBar` exports `serializeFilters` and `serializeFilterValue` helpers for FHIR search parameter serialization.

### Styling
- **Tailwind CSS v4** with `@tailwindcss/vite` plugin.
- Dark mode support via `dark:` classes.
- `primary` color is configured in Tailwind theme.

### Routing
- SvelteKit file-based routing in `src/routes/`.
- Common patterns: list pages (`/+page.svelte`) with `SearchBar` + `ResourceTable`/`Spinner`/`Empty`.
- Detail pages (`/[id]/+page.svelte`) for individual resources.

### TypeScript
- `tsconfig.json` at project root.
- FHIR types from `fhir/r4b` package.
- Additional types in `src/lib/types/fhir.d.ts`.

## File Conventions

- Svelte 5 runes mode (no `svelte:options` needed, use `$state`, `$derived`, `$effect`, `$props`).
- Page components: `src/routes/<path>/+page.svelte`
- Layout: `src/routes/+layout.svelte`
- Components: `src/lib/components/<Name>.svelte`
- Utilities: `src/lib/utils/<name>.ts`
- Tests: co-located as `<name>.test.ts` or `<name>.spec.ts`
