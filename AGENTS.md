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
| `npm run build:lib` | Build library distribution (vite.lib.config.ts) |

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

## v2 Architecture Modules

### Authentication (`src/lib/auth/`)
- OAuth2 Authorization Code flow with PKCE (`oauth.ts`)
- localStorage token management (`token.ts`)
- Role enum + permissions mapping (`role.ts`, `permissions.ts`)
- Current user context with JWT decoding (`user.ts`)
- Role-based menu filtering in AppSidebar
- Hooks: `src/hooks.server.ts`, `src/hooks.client.ts`

### AI Integration (`src/lib/ai/`)
- Service client for summaries, scribe, questionnaire generation (`service.ts`)
- Patient summary from $everything bundle (`summary.ts`)
- Web Speech API scribe (`scribe.ts`)
- Questionnaire generation from text (`questionnaire.ts`) and PDF (`questionnaire-pdf.ts`)
- Magic search with natural language parsing (`magic-search.ts`)
- Components: `AISummaryWidget.svelte`, `AIScribeButton.svelte`

### Video Calls (`src/lib/video/`)
- Jitsi iframe wrapper (`VideoCall.svelte`, `VideoCallModal.svelte`)
- JWT token generation (`jitsi.ts`)

### Scheduling (`src/lib/calendar/`)
- FullCalendar integration (`ScheduleCalendar.svelte`)
- Appointment CRUD wrappers (`appointment.ts`)
- Availability helpers (`availability.ts`)
- Components: `NewAppointmentModal.svelte`, `HealthcareServicePractitionerSelect.svelte`

### Form Builder (`src/lib/forms/builder/`)
- Drag-and-drop builder using `svelte-dnd-action` (`Builder.svelte`)
- Item settings panel (`QuestionnaireItemSettings.svelte`)
- Save/publish form (`QuestionnaireSaveForm.svelte`)
- Sidebar navigation (`QuestionnaireSidebarNavigation.svelte`)
- Modal group editing (`ModalQuestionnaireGroupItem.svelte`)

### Notifications (`src/lib/state/notifications.svelte.ts`)
- Module-level `$state` notification store
- NotificationCenter slide-out panel + badge in AppHeader

### Dashboard Config (`src/lib/dashboard/`)
- JSON-configured dynamic widgets (`config.ts`, `context.ts`)
- `Dashboards.svelte` accepts config and renders widgets

## v3 Architecture Modules

### Patient Dynamic Dashboard (`src/lib/dashboard/` + `src/lib/components/patient/`)
- JSON-configured dashboard cards (`patientDashboardConfig.ts`)
- 9 card types: Summary, GeneralInfo, Appointments, Conditions, Allergies, Medications, Immunizations, Procedures, Notes
- Drag-drop reordering with `svelte-dnd-action`
- Per-practitioner config persistence in localStorage

### Patient Encounters Tab (`src/lib/components/patient/PatientEncounterList.svelte`)
- Encounters list within patient context with status/date filters
- Start/Finish/Change status workflow
- Links to encounter workspace

### Patient Document Workflow (`src/routes/patients/[id]/documents/[documentId]/`)
- Form-filling page (`+page.svelte`) with patient context pre-filled
- QuestionnaireResponse view/edit details page
- Auto-save draft with provenance tracking

### Public Appointment Booking (`src/routes/appointment/book/+page.svelte`)
- 5-step flow: Service → Practitioner → Time Slot → Patient Info → Confirmation
- No auth required, creates Patient + Appointment resources

### Document History & Diff (`src/lib/components/patient/DocumentHistory.svelte`)
- Provenance-based history viewer with `_history` + `/$query/provenance-by-*`
- Visual diff with `getFormDataDiff()` utility
- Inline and side-by-side diff modes

### Batch Actions (`src/lib/components/table/BatchActionToolbar.svelte`)
- Row selection with checkboxes in ResourceTable
- Batch actions: Finish Encounters, Delete, Export CSV
- Role-based visibility (Practitioner/Admin)
- Confirmation modal for destructive actions

### Advanced SearchBar (`src/lib/components/SearchBar.svelte`)
- 7 filter types: STRING, DATE, REFERENCE, VALUESET, CHOICE, SPLITSTRING, SELECTCHOICE
- Async Reference search with dropdown
- ValueSet expansion for coded filters

### SMART on FHIR (`src/lib/smart/`)
- Launch context generation (`launch.ts`)
- App whitelist config (`config.ts`)
- Iframe modal for SMART apps (`SmartAppModal.svelte`)
- External document viewing via `postMessage`

### Charting / Flowsheet (`src/lib/components/charting/`)
- Table/grid view for repeated observations
- Vital signs support: BP, HR, Temp, SpO2, Weight
- Chart.js line chart toggle
- Add observation form

### Practitioner Scheduling (`src/lib/components/practitioner/`)
- Availability calendar with busy/free indicators
- Schedule list with appointment management
- Time slot add/remove with localStorage persistence

### AI Assistant Sidebar (`src/lib/components/ai/AIAssistantSidebar.svelte`)
- Collapsible 320px right panel
- Web Speech API voice input with animated wave bars
- Context-aware commands (patient info, encounter actions)
- Toggle button in AppHeader

### Form Engine Widgets (`src/lib/forms/widgets/`)
- 14 total widgets including new: GroupVoice, GroupTabs, TimeRangePicker, UploadFileControl, InlineChoice
- Widget registry in `widgetRegistry.ts`

### UI Primitives (`src/lib/components/`)
- LinkToEdit, TextWithMacroFill, Report, TitleDetails, AlertMessage, Breadcrumbs, Wizard, Tabs, SearchableSelect, ConfirmActionButton

## File Conventions

- Svelte 5 runes mode (no `svelte:options` needed, use `$state`, `$derived`, `$effect`, `$props`).
- Page components: `src/routes/<path>/+page.svelte`
- Layout: `src/routes/+layout.svelte`
- Components: `src/lib/components/<Name>.svelte`
- Utilities: `src/lib/utils/<name>.ts`
- Tests: co-located as `<name>.test.ts` or `<name>.spec.ts`
- State modules: `.svelte.ts` files for rune-based state
