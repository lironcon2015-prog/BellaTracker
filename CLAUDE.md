# CLAUDE.md — BellaTracker / GymStart

AI assistant guide for working in this repository. Read this before making any changes.

---

## Project Overview

**BellaTracker** (branded as **GymStart**) is an offline-first Progressive Web App (PWA) for tracking women's gym workouts. It is a **100% static, vanilla JavaScript** application — no build system, no npm, no frameworks.

- **Language:** Hebrew (RTL)
- **Version:** 1.8.2 (tracked in `version.json` and `sw.js`)
- **Target:** Mobile browsers (iOS Safari, Android Chrome) installable as a native-like app

---

## Repository Structure

```
BellaTracker/
├── index.html       # All HTML — screens + modals (503 lines)
├── script.js        # All application logic (~1850 lines)
├── style.css        # All styling — OLED glassmorphic dark theme (626 lines)
├── sw.js            # Service Worker — Cache-First offline support
├── manifest.json    # PWA manifest (name: GymStart, RTL, Hebrew)
├── version.json     # Current version string {"version":"1.8.2-6"}
└── icon.png         # 512×512 app icon
```

No `node_modules`, no `package.json`, no build artifacts.

---

## Key Architecture

### No Build System
- Edit files directly — changes take effect immediately when served
- There is no transpilation, bundling, or compilation step
- To "deploy," simply update the files and bump the version (see below)

### Single-Object App Pattern (`script.js`)
All application logic lives in a single global `app` object with:
- `app.state` — all runtime state
- `app.init()` — entry point, called on `DOMContentLoaded`
- `app.loadData()` / `app.saveData()` — LocalStorage persistence
- 60+ methods for UI rendering, workout lifecycle, history, and admin features

### Global Singletons
```js
CONFIG          // localStorage key names and app version
CURRENT_VERSION // must match version.json — used for update detection
BASE_BANK_INIT  // 29 default exercise definitions (immutable seed data)
DEFAULT_ROUTINES_V17 // default workout programs A & B
FirebaseManager // optional cloud sync (defined at bottom of script.js)
```

### LocalStorage Keys
| Key | Content |
|-----|---------|
| `gymstart_v1_7_routines` | User's workout programs |
| `gymstart_beta_02_history` | All completed workout sessions |
| `gymstart_v1_7_exercises_bank` | Exercise definitions |
| `gymstart_active_workout_state` | In-progress session (for resume) |

**Important:** Key names are versioned — changing them causes data loss for existing users.

---

## Data Formats

### Exercise Definition
```js
{
  id: 'goblet',
  name: 'גובלט סקוואט',
  cat: 'legs',                          // legs|chest|back|shoulders|arms|core
  settings: {
    unit: 'kg',                         // kg|plates|bodyweight|time
    step: 2.5, min: 2.5, max: 60
  }
}
```

**`unit: 'time'`** is special — renders a stopwatch instead of weight/rep inputs (used for planks).
**`unit: 'bodyweight'`** renders reps only (no weight).

### Session History Entry
```js
{
  date: "DD/MM/YYYY",
  program: "A",
  programTitle: "רגליים וגב (A)",
  totalTime: 3600000,                   // milliseconds
  data: [
    {
      id: "goblet",
      name: "גובלט סקוואט",
      sets: [
        { w: 10, r: 12, feel: "good" } // feel: easy|good|hard
      ]
    }
  ]
}
```

---

## UI Structure

### Screens (in `index.html`)
| Screen ID | Purpose |
|-----------|---------|
| `screen-home` | Welcome + last workout summary |
| `screen-program-select` | Choose workout routine |
| `screen-overview` | View program exercises |
| `screen-active` | Live workout interface |
| `screen-summary` | Post-workout summary + PRs |
| `screen-history` | Browse past sessions |

Navigation is handled by `app.showScreen(id)` — only one screen is visible at a time.

### Modals & Overlays
- `modal-admin` — Program editor (admin tools)
- `modal-firebase` — Firebase cloud sync configuration
- `modal-reorder` — Drag-to-reorder exercises mid-workout
- `modal-tips` — Exercise tip/coach note editor
- `modal-exercise-selector` — Add exercises to programs
- `modal-ex-manager` — Exercise bank manager
- `coach-update-sheet` — Bottom sheet for receiving coach updates
- `range-copy-sheet` — Copy history by date range

---

## Development Workflow

### Making Changes
1. Edit `index.html`, `script.js`, or `style.css` directly
2. Test in a browser (open `index.html` via a local HTTP server — Service Worker requires HTTPS or localhost)
3. Bump the version (see below)
4. Commit and push

### Version Bumping (required after every code change)
When modifying any cached file (`index.html`, `script.js`, `style.css`, `manifest.json`, `icon.png`), **both** of these must be updated:

1. **`version.json`** — update the version string:
   ```json
   {"version":"1.8.2-7"}
   ```

2. **`sw.js`** — update `CACHE_VERSION` to match:
   ```js
   const CACHE_VERSION = 'gymstart-v1.8.2-7';
   ```

3. **`script.js`** — update `CURRENT_VERSION` constant (used for in-app update prompts):
   ```js
   const CURRENT_VERSION = '1.8.2-7';
   ```

**Why:** The Service Worker uses Cache-First strategy. Without bumping the cache version, users will continue seeing the old cached version. The `version.json` is always fetched from the network specifically to detect updates.

### Version Format
`MAJOR.MINOR.PATCH-BUILD` where BUILD increments for hotfixes within a patch.

---

## Design System & CSS Conventions

### Theme
- **Background:** Pure black (`#000000`) — OLED optimized
- **Accent:** Cyan (`#00ffee`) with glow shadow effects
- **Cards:** Glassmorphic with `backdrop-filter: blur()` and semi-transparent backgrounds
- **Font:** Rubik (Hebrew-compatible, loaded from Google Fonts)
- **Text direction:** RTL throughout (`dir="rtl"` on `<html>`)

### CSS Variable (defined in `:root`)
```css
--accent: #00ffee
--bg: #000
--card-bg: rgba(255,255,255,0.04)
/* plus safe-area insets for notch devices */
```

### Key CSS Classes
| Class | Purpose |
|-------|---------|
| `.oled-card` | Glass card container |
| `.btn-primary` | Gradient cyan CTA button |
| `.screen` | Full-screen view container |
| `[data-screen="active"]` | Active screen gets display:flex |

---

## Firebase Integration

Firebase is **optional** — the app works fully offline without it. When configured:
- Users paste their Firebase project config JSON via the settings modal
- Config is stored in localStorage (never in source code)
- Provides cloud backup/restore of history and workout programs
- Coach-to-athlete config sharing via Firestore

`FirebaseManager` (bottom of `script.js`) handles all Firebase interactions. It uses Firebase SDK v9.23.0 loaded from CDN in compat mode.

---

## Git & Deployment

### Branch Convention
- `master` — stable production branch
- `main` — tracked on remote origin
- Feature branches: `claude/<description>-<id>`

### Commit Workflow
1. Edit files
2. Bump version in `version.json`, `sw.js`, and `script.js`
3. Commit with descriptive message
4. Push to feature branch, then merge to master

### No CI/CD
There are no automated tests, linters, or CI pipelines. Manual testing in browser is required.

---

## Common Tasks

### Adding a New Exercise
1. Add entry to `BASE_BANK_INIT` array in `script.js` with a unique `id`
2. Choose appropriate `unit`: `kg`, `plates`, `bodyweight`, or `time`
3. The exercise will be available in the exercise selector modal automatically

### Adding a New Screen
1. Add `<div id="screen-foo" class="screen" style="display:none">` in `index.html`
2. Add navigation via `app.showScreen('screen-foo')` calls
3. Add render method `app.renderFoo()` in `script.js`

### Modifying Workout State
All active workout state lives in `app.state.active`. Key fields:
- `on`: boolean — workout in progress
- `sessionExercises[]`: exercises for current session
- `exIdx`, `setIdx`: current position
- `log[]`: completed sets
- `startTime`, `accumulatedTime`: for elapsed time calculation

### Updating Styles
- All styles are in `style.css` — no CSS modules or preprocessors
- Use CSS variables (`var(--accent)`) for colors
- Keep RTL in mind — use `margin-inline-start` / `padding-inline-end` where appropriate

---

## Important Constraints

- **No npm or build tools** — do not introduce them without discussion
- **No external libraries** — beyond Firebase SDK and Rubik font (both CDN)
- **No ES modules** — the app uses a single script tag, no `import/export`
- **Hebrew content** — UI text is in Hebrew; do not translate or replace with English unless asked
- **LocalStorage key stability** — never rename existing localStorage keys (causes data loss)
- **RTL layout** — all UI must work correctly in right-to-left direction
- **Mobile-first** — design for touch, no hover-only interactions
- **Always bump version** — after any change to cached files

---

## Testing

No automated test suite exists. Manual testing checklist:
- Open `index.html` via `localhost` (required for Service Worker)
- Test on mobile screen size (375px width minimum)
- Verify offline functionality after first load
- Check Hebrew text renders correctly
- Test workout flow: select program → start → log sets → finish → view history
