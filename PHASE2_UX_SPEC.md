# Phase 2 — UX and Screen Architecture Spec

This document defines the navigation structure, screen purposes, layouts, and interaction rules for PulseLine V1.
Wireframe-level precision only — no final visuals, no brand polish.

---

## 1. Navigation Structure

Single linear stack. No tabs. No drawer.

```
LaunchScreen
     ↓ (auto, ~2s)
HomeScreen
     ↓ (tap Play)
ScenarioSelectScreen
     ↓ (tap scenario)
GameplayScreen
     ↓ (stabilized or failed)
ResultScreen
     ↓ (tap Retry → GameplayScreen)
     ↓ (tap Home → HomeScreen)

HomeScreen → SettingsScreen (gear icon)
SettingsScreen → HomeScreen (back)
```

All transitions are push/pop on a single stack navigator.

---

## 2. Screen Definitions

---

### Screen 1 — LaunchScreen

**Purpose:** Brand moment. Auto-advances to Home.

**Contents:**
- App name: `PULSELINE`
- Subtitle: `Emergency Stabilization`
- Pulse/waveform animation (simple, looping)
- No buttons

**Behavior:**
- Displays for ~2 seconds on cold start
- Transitions automatically to HomeScreen

---

### Screen 2 — HomeScreen

**Purpose:** Entry point. Start game or access settings.

**Contents:**
- App name at top
- `PLAY` — primary CTA button, large, centered
- `SETTINGS` — gear icon button, top-right corner
- Tagline: `"Stabilize the patient. Every second counts."`

**Behavior:**
- PLAY → ScenarioSelectScreen
- SETTINGS → SettingsScreen

---

### Screen 3 — ScenarioSelectScreen

**Purpose:** Choose which scenario to play.

**Contents:**
- Screen title: `SELECT SCENARIO`
- 3 scenario cards, vertically stacked
- Each card contains:
  - Scenario name (e.g. `TACHYARRHYTHMIA`)
  - One-line description (e.g. `"Heart rate critical. Rhythm unstable."`)
  - Difficulty label matching SS tier color (Warning / Critical)
  - Best score for that scenario (from local storage; blank if never played)
- Back button (top-left)

**Behavior:**
- Tap card → GameplayScreen for that scenario
- Back → HomeScreen

**Scenario card descriptions:**

| Scenario | Description | Difficulty |
|---|---|---|
| Tachyarrhythmia | Heart rate critical. Rhythm unstable. | Warning |
| Hypoxemia | Oxygen saturation falling. Act fast. | Warning |
| Hypotensive Shock | Blood pressure collapsing. Perfusion failing. | Critical |

---

### Screen 4 — GameplayScreen

**Purpose:** The core gameplay experience.

**Layout — 3 vertical zones:**

```
┌─────────────────────────────┐
│         STATUS BAR          │  thin strip — scenario name, timer, SS indicator
├─────────────────────────────┤
│                             │
│         MONITOR ZONE        │  ~55% screen height
│                             │
├─────────────────────────────┤
│                             │
│        CONTROLS ZONE        │  ~40% screen height
│                             │
└─────────────────────────────┘
```

---

#### 4.1 Status Bar

| Element | Position | Content |
|---|---|---|
| Scenario label | Left | Scenario name in small caps |
| Countdown timer | Center | Remaining time (MM:SS) |
| Stability indicator | Right | Colored dot — green/amber/red per SS tier |

---

#### 4.2 Monitor Zone

```
┌─────────────────────────────┐
│  [WAVEFORM — full width]    │  scrolling ECG-style line
├────────────┬────────────────┤
│  HR        │  SpO₂          │
│  145 bpm   │  86%           │
├────────────┼────────────────┤
│  BP        │  RHYTHM        │
│  105/70    │  TACHY         │
└────────────┴────────────────┘
```

**Waveform:**
- Full width, top ~40% of monitor zone
- Scrolls continuously left
- Line color reflects HR severity (green → amber → red)

**Vitals grid (2×2):**

| Cell | Vital | Format |
|---|---|---|
| Top-left | Heart Rate | `145 bpm` |
| Top-right | SpO₂ | `86%` |
| Bottom-left | Blood Pressure | `105/70` |
| Bottom-right | Rhythm | `SINUS` / `TACHY` / `VFIB` |

Each cell:
- Label (small, muted)
- Value (large, bold)
- Color state: green (normal), amber (warning), red (critical/failing)

---

#### 4.3 Controls Zone

2×2 grid of intervention buttons:

```
┌──────────────┬──────────────┐
│   OXYGEN     │  IV FLUIDS   │
├──────────────┼──────────────┤
│ RATE-CONTROL │ CARDIOVERSION│
└──────────────┴──────────────┘
```

Each button:
- Name label
- Icon (simple glyph)
- Cooldown state: shows countdown ring or timer text when on cooldown
- Ineligible state: visually dimmed but still tappable
  - Tapping ineligible button → audio rejection tone + haptic + score penalty applied

**Button availability per scenario:**

| Button | Scenario 1 | Scenario 2 | Scenario 3 |
|---|---|---|---|
| Oxygen | ✓ | ✓ | ✓ |
| IV Fluids | ✗ | ✓ | ✓ |
| Rate-Control | ✓ | ✓ | ✗ |
| Cardioversion | ✓ | ✓ (risky) | ✗ |

Unavailable buttons (not in scenario) are hidden, not dimmed.
Ineligible buttons (in scenario but condition not met) are dimmed.

---

### Screen 5 — ResultScreen

**Purpose:** Show outcome, score breakdown, and prompt next action.

**Layout:**

```
┌─────────────────────────────┐
│   STABILIZED / PATIENT LOST │  large outcome label, color-coded
├─────────────────────────────┤
│   Score: 1450               │
│   Best:  1620               │
├─────────────────────────────┤
│   Time: 48s   Par: 60s      │
│   Correct actions: 3        │
│   Harmful actions: 0        │
├─────────────────────────────┤
│  [ RETRY ]      [ HOME ]    │
└─────────────────────────────┘
```

**Outcome header:**
- `STABILIZED` — green
- `PATIENT LOST` — red

**Score block:**
- Total score for this run
- All-time best score for this scenario (from local storage)

**Stats block:**
- Time taken vs par time
- Count of correct interventions
- Count of harmful/misapplied interventions

**Actions:**
- `RETRY` → GameplayScreen (same scenario, fresh state)
- `HOME` → HomeScreen

---

### Screen 6 — SettingsScreen

**Purpose:** Toggle sound and haptics.

**Contents:**
- Screen title: `SETTINGS`
- Sound toggle (on / off)
- Haptics toggle (on / off)
- App version string (bottom, small, muted)
- Back button (top-left)

**Behavior:**
- Toggles persist immediately to local storage on change
- Back → HomeScreen

---

## 3. First-Run Guidance

No tutorial screen. No overlay wizard. No forced pause.

**Approach: single dismissible hint banner**

- On the first launch of each scenario, a thin banner appears above the controls zone
- Text: `"Watch the vitals. Choose an intervention."`
- Dismissed automatically after the player's first intervention tap
- Flag stored per scenario in local storage — never shown again after dismissed

This keeps tension intact from the first second. The color system and labels teach through play.

---

## 4. Interaction Notes

- All buttons respond immediately — no loading states
- Cooldown timers count down visually on the button face
- Vitals update every tick (1 second) — numbers animate on change (brief scale or color flash)
- Waveform scrolls continuously regardless of tick boundary
- Timer counts down from scenario time limit — displayed as MM:SS
- No pause button in V1 — the game runs until outcome

---

## 5. Color System (from README section 17.4)

| Color | Meaning |
|---|---|
| Green | Stable / normal range |
| Amber | Warning range |
| Red | Critical / failing range |
| Blue | Oxygen / support action accent |
| Background | Dark — near-black |

---

## 6. Phase 2 Acceptance Criteria

- [x] A user can understand the main loop in under 15 seconds
- [x] The gameplay screen is readable under stress
- [x] Every screen has a defined purpose, contents, and transition behavior
- [x] No final visuals or brand decisions required before Phase 3

---

## Next Step

**Phase 3 — Technical Foundation**

Initialize the React Native project, set up navigation, configure the state store, define core types, create the directory structure, and establish the simulation loop pattern. No gameplay tuning or polished waveform visuals yet.
