# Offline React Native Medical Game — Master Product & Delivery Brief

This document is the **single source of truth** for planning, designing, and building the application end to end.

It is written to serve three purposes at once:

1. **Internal build blueprint** for engineering and AI-assisted development
2. **Phase-controlled execution guide** so the AI does not try to build everything in one pass
3. **Client-facing product brief** that is precise, realistic, and medically credible within a game context

This is the **first and final master document** to use before showing the concept to a client.

---

# 1. Product Definition

## 1.1 Working Title

**PulseLine**

Subtitle for presentations:
**An offline, medically grounded emergency stabilization simulation for mobile**

---

## 1.2 Product Summary

PulseLine is a **single-player offline mobile simulation game** built with **React Native** that places the user in a time-critical clinical decision loop.

The player monitors a patient’s vital signs and must make correct interventions under pressure to stabilize the patient.

The experience is designed to feel:

* tense
* readable
* medically plausible
* rewarding
* replayable

This is **not** a hospital management game, not a surgery simulator, and not a fantasy arcade game with fake medical effects.

It is a **compressed emergency response simulation** built around medically inspired cause-and-effect.

---

## 1.3 Product Goal

Build a high-quality mobile experience that:

* works **fully offline**
* is **easy to understand in seconds**
* has **short session gameplay**
* uses **medically plausible logic**
* feels serious and polished enough to present to clients

---

## 1.4 Core Value Proposition

The product stands on four pillars:

### A. Offline Completeness

The app must feel complete with **zero internet, zero login, zero backend dependency**.

### B. Medical Plausibility

The game must simplify medicine without becoming absurd.

### C. High Clarity Under Pressure

The screen should feel like a clinical monitor, but still be understandable to a non-clinician player.

### D. Strong Device Experience

Fast interaction, responsive feedback, clean rendering, audio/haptics, and minimal lag.

---

# 2. Intended Product Positioning

## 2.1 What This Product Is

* a mobile medical simulation game
* a tension-driven stabilization experience
* an educationally adjacent but primarily gameplay-first product
* a visually polished offline app

## 2.2 What This Product Is Not

* not a diagnostic tool
* not a clinical training replacement
* not a medical device
* not a full emergency medicine curriculum
* not a realistic hospital workflow simulator
* not multiplayer
* not backend-driven
* not dependent on live patient databases or external services

---

# 3. Audience Definition

## 3.1 Primary Audience

* general users who enjoy high-pressure simulation or decision games
* users attracted to medical monitoring visuals and life-or-death gameplay tension

## 3.2 Secondary Audience

* students or curious learners who enjoy medically inspired mechanics
* clients looking for a polished healthcare-themed interactive product concept

## 3.3 Non-Target Audience for V1

* professional clinicians expecting full protocol fidelity
* users expecting a multiplayer or hospital-management game
* users expecting deep academic learning modules in v1

---

# 4. Platform Scope

## 4.1 Initial Platforms

* iOS
* Android

## 4.2 App Mode

* fully offline on first launch
* no forced sign-in
* no cloud sync
* no API dependency

---

# 5. Medical Design Boundary

This section exists to keep the product credible.

## 5.1 Medical Scope Philosophy

The simulation must be:

* **simplified enough to be playable**
* **accurate enough to feel respectful**
* **limited enough to avoid pretending to be a real medical device**

## 5.2 Design Rule

Use **medically plausible relationships**, not complete medical realism.

Example:

* low oxygen should not magically fix blood pressure
* beta-blockade may reduce heart rate but can worsen hypotension
* fluids may improve perfusion but can be harmful if overused
* electrical cardioversion is a powerful intervention and should be treated as such

## 5.3 Explicit Medical Safety Boundaries

The app must clearly avoid implying that:

* it provides diagnosis
* it replaces clinical decision-making
* it teaches exact real-world emergency response certification

## 5.4 Scope of Medical Conditions for V1

V1 should include **only a small number of carefully selected scenarios**.

Recommended V1 scenario set:

* **Tachyarrhythmia with instability risk**
* **Hypoxemia / oxygenation failure**
* **Hypotensive shock / poor perfusion**

These scenarios are enough to create meaningful gameplay while keeping complexity controlled.

## 5.5 Conditions Explicitly Out of Scope for V1

Do **not** include these in the first release:

* pediatric cases
* pregnancy-specific emergencies
* trauma systems with bleeding mechanics
* stroke workflow
* sepsis pathway realism beyond simplified shock logic
* ventilator configuration depth
* lab interpretation systems
* arrhythmia classification depth beyond the designed scenario set
* medication dosage realism beyond gameplay-safe abstraction

---

# 6. Product Experience Goals

## 6.1 Session Design

Target session length:

* **30 seconds to 2 minutes** for an individual attempt

This supports:

* replayability
* fast learning
* mobile suitability
* score chasing

## 6.2 Emotional Experience

The player should feel:

* urgency
* responsibility
* tension
* recovery relief
* satisfaction from reading the monitor correctly

## 6.3 UX Principle

**Clarity beats realism**.

The app should look clinically inspired, but the interface must remain readable under pressure.

---

# 7. Core Gameplay Loop

1. Scenario begins
2. Patient presents with abnormal vitals
3. Monitor displays evolving signals
4. Player observes changes
5. Player chooses interventions
6. Interventions affect multiple systems
7. Patient either stabilizes or deteriorates
8. Result screen summarizes outcome and score
9. Player retries or advances

---

# 8. Core Systems

## 8.1 Vital Signs System

The simulation should revolve around a compact set of core vitals:

* Heart Rate (HR)
* Blood Pressure (systolic + diastolic or simplified MAP representation)
* Oxygen Saturation (SpO₂)
* Rhythm state / rhythm category
* Perfusion / stability score

Optional display element:

* waveform / pulse quality indicator

## 8.2 Intervention System

Recommended V1 interventions:

* Oxygen
* IV Fluids
* Rate-control medication / simplified beta-blocker mechanic
* Synchronized cardioversion

Each intervention must have:

* eligibility rules
* cooldown or timing consequence
* positive effect
* downside or risk

## 8.3 Deterioration System

A patient should worsen over time when untreated.

Deterioration should be based on:

* current condition
* untreated instability
* incorrect interventions
* delayed response

## 8.4 Stability System

A derived **stability score** should determine whether the patient is:

* improving
* unstable
* critical
* failed

This keeps gameplay readable while underlying vitals stay more detailed.

## 8.5 Scoring System

Score should reward:

* fast recognition
* correct intervention choice
* minimal harmful actions
* successful stabilization

Do not overcomplicate scoring in V1.

---

# 9. Offline-Only Architecture

## 9.1 Architecture Principle

This app must be architected as a **complete device-local application**.

System shape:

```text
[ React Native UI ]
        ↓
[ Simulation Engine ]
        ↓
[ Local State / Persistence ]
        ↓
[ Bundled Assets / Static Scenario Data ]
```

## 9.2 Forbidden Architecture Assumptions

Do not introduce:

* backend APIs
* cloud sync
* auth systems
* admin dashboards
* CMS
* analytics vendors in the core build plan

If analytics are ever needed later, they must be an optional future phase and not part of the product’s core dependency model.

---

# 10. Recommended Technical Stack

## 10.1 App Framework

* React Native

## 10.2 Rendering

* React Native Skia for waveform and monitor visuals

## 10.3 Animation

* Reanimated for smooth UI-thread-driven animation

## 10.4 State Management

* Zustand or similarly minimal store

## 10.5 Persistence

Priority order:

1. MMKV for fast local key-value storage
2. AsyncStorage for simpler MVP fallback

## 10.6 Audio / Haptics

* expo-av or equivalent lightweight audio solution
* expo-haptics or native alternative

## 10.7 Build Philosophy

Favor:

* minimal moving parts
* deterministic logic
* low overhead
* small surface area

Avoid game engines unless absolutely necessary.

---

# 11. Engineering Principles

## 11.1 Separate Simulation from Rendering

The medical/game logic must **not** depend on React component re-renders.

The simulation engine should:

* update on a controlled tick
* mutate/store state predictably
* expose display-ready values to the UI

## 11.2 Deterministic Over Random

Randomness should be minimal and controlled.

The game should feel challenging because the player misread the state or acted badly, not because the engine rolled nonsense.

## 11.3 Small, Sharp Models

Keep the simulation model small.

Too much realism will destroy speed, clarity, and maintainability.

## 11.4 Performance First

The app must avoid expensive per-tick React tree churn.

---

# 12. Product Scope for V1

## 12.1 Must-Have Features

* launch screen
* home screen
* scenario selection
* gameplay monitor screen
* action controls
* result screen
* local best-score persistence
* sound toggle
* haptics toggle
* 3 tightly designed scenarios

## 12.2 Nice-to-Have Features (Only if Core Is Stable)

* tutorial overlay
* progressive unlock system
* scenario difficulty tiers
* lightweight glossary

## 12.3 Strictly Excluded from V1

* accounts
* online leaderboards
* multiplayer
* live chat
* backend content updates
* cloud saves
* wearable integration
* real patient mode
* clinician dashboard

---

# 13. Phase-Based Build Plan

This section is the most important for AI-assisted execution.

The AI must complete **one phase at a time**.
It must **not jump ahead** and it must **not attempt full-app generation in one response**.

Each phase must end with:

* clear deliverables
* acceptance criteria
* open issues
* exact next step

---

## Phase 0 — Product Lock

### Goal

Freeze the product definition before implementation.

### Tasks

* finalize game concept
* finalize target audience
* lock medical boundaries
* lock v1 scenario list
* lock intervention list
* define what is out of scope

### Deliverables

* final concept summary
* scenario list
* intervention list
* scope boundary list

### Acceptance Criteria

* everyone can explain what the app is in one paragraph
* there is no confusion about whether the app is offline, educational, clinical, or entertainment-first

### Do Not Do Yet

* no code
* no UI build
* no detailed animation work

---

## Phase 1 — Simulation Design

### Goal

Design the underlying medical-game logic.

### Tasks

* define the vital signs model
* define derived stability logic
* define deterioration rules
* define each intervention’s effects and risks
* define fail and success conditions
* define scenario-specific initial states

### Deliverables

* written simulation spec
* state model definitions
* intervention rule table
* scenario parameter table

### Acceptance Criteria

* every gameplay action has a predictable effect
* the system is playable on paper before coding
* there are no contradictory rules

### Do Not Do Yet

* no polished UI
* no asset production
* no sound design

---

## Phase 2 — UX and Screen Architecture

### Goal

Define the app’s screens and user flow.

### Tasks

* design navigation structure
* define screen purposes
* define monitor layout
* define controls layout
* define results screen contents
* define tutorial approach or first-run guidance

### Deliverables

* app flow map
* wireframe-level screen descriptions
* interaction notes

### Acceptance Criteria

* a user can understand the main loop in under 15 seconds
* the gameplay screen is readable under stress

### Do Not Do Yet

* no final visuals
* no detailed brand polish

---

## Phase 3 — Technical Foundation

### Goal

Set up the codebase and architecture skeleton.

### Tasks

* initialize RN project
* set up navigation
* set up state store
* set up persistence layer
* define core types
* create directory structure
* establish simulation loop pattern

### Deliverables

* project scaffold
* folder architecture
* typed models
* empty screen shells
* storage abstraction

### Acceptance Criteria

* project runs locally
* architecture supports offline-only execution cleanly
* simulation logic can be added without restructuring the app

### Do Not Do Yet

* no final gameplay tuning
* no polished waveform visuals

---

## Phase 4 — Core Simulation Implementation

### Goal

Build the medical-game engine without polish.

### Tasks

* implement tick/update system
* implement vitals transitions
* implement intervention application logic
* implement scenario initialization
* implement fail / success checks
* connect state to a temporary debug UI

### Deliverables

* functioning simulation engine
* developer test screen
* reproducible scenario runs

### Acceptance Criteria

* scenarios can be played in raw form
* correct and incorrect actions visibly change patient state
* logic feels coherent before visual polish

### Do Not Do Yet

* no final sound package
* no final art pass

---

## Phase 5 — Gameplay UI

### Goal

Turn the raw engine into a playable product.

### Tasks

* build monitor screen
* build waveform and vitals display
* build intervention controls
* connect alerts, color states, and warning states
* add result screen and score output

### Deliverables

* playable loop from start to finish
* usable mobile UI
* visible state transitions

### Acceptance Criteria

* gameplay is understandable without debug overlays
* actions feel immediate
* core loop works on real devices

### Do Not Do Yet

* no extra scenarios beyond locked v1 scope

---

## Phase 6 — Feedback Layer

### Goal

Add sensory quality and urgency.

### Tasks

* add sound cues
* add beeps / alarms
* add haptics
* add micro-animations
* refine critical state readability

### Deliverables

* sound-enabled build
* haptic-enabled build
* improved player feedback

### Acceptance Criteria

* player can feel deterioration and recovery without reading every number constantly

### Do Not Do Yet

* no feature creep
* no online systems

---

## Phase 7 — Persistence and Progression

### Goal

Add offline retention systems.

### Tasks

* store best scores
* store settings
* store unlock state if used
* restore previous preferences on app launch

### Deliverables

* local save behavior
* settings persistence

### Acceptance Criteria

* app remains fully usable without internet
* progress survives app restarts

---

## Phase 8 — Balancing and Difficulty Tuning

### Goal

Make the game fair, readable, and replayable.

### Tasks

* tune scenario starting values
* tune deterioration speed
* tune intervention strength
* tune score weighting
* remove frustrating or misleading behavior

### Deliverables

* tuning matrix
* difficulty notes
* revised balance values

### Acceptance Criteria

* failure feels deserved
* success feels earned
* player can improve through pattern recognition rather than luck

---

## Phase 9 — QA and Device Validation

### Goal

Stabilize the build for review.

### Tasks

* test iOS and Android
* test low battery / background / app resume behavior
* test storage persistence
* test animation smoothness
* test edge cases in each scenario
* verify no internet dependency exists

### Deliverables

* QA checklist
* defect list
* resolved bug summary

### Acceptance Criteria

* app runs cleanly on supported devices
* no broken offline flow
* no critical logic bugs in core scenarios

---

## Phase 10 — Client Review Package

### Goal

Prepare the product for presentation.

### Tasks

* finalize product description
* finalize feature list
* finalize scope notes
* create presentation demo path
* prepare explanation of medical boundary and disclaimer

### Deliverables

* client-ready product summary
* screen list
* phase summary
* demo script
* disclaimer language

### Acceptance Criteria

* a client can understand the concept, build quality, and scope clearly
* there is no ambiguity about what is simulated versus what is clinically real

---

# 14. AI Execution Protocol

This section is mandatory for Claude, Codex, or any AI agent.

## 14.1 Execution Rule

The AI must work **phase by phase only**.

It must not:

* generate the entire app at once
* jump from concept to polish in one step
* introduce unapproved features
* expand medical scope casually

## 14.2 Required Output Pattern Per Phase

For every phase, the AI must output:

### A. Objective

What this phase is solving

### B. Deliverables

What will be produced now

### C. Constraints

What must not be changed or expanded

### D. Implementation

Code, structure, logic, or design for this phase only

### E. Review Notes

Risks, assumptions, and what must be validated

### F. Next Step

Exactly which phase comes next

## 14.3 AI Forbidden Behaviors

* do not invent backend systems
* do not introduce online dependencies
* do not over-model medicine
* do not produce giant code dumps without structure
* do not redesign previous locked decisions without justification

---

# 15. Suggested App Structure

```text
/src
  /app
    /screens
      HomeScreen
      ScenarioSelectScreen
      GameplayScreen
      ResultScreen
      SettingsScreen
  /components
    Monitor
    Waveform
    VitalCard
    ActionButton
    StatusBanner
  /simulation
    engine
    scenarios
    interventions
    formulas
    types
  /store
    gameStore
    settingsStore
  /storage
    persistence
  /audio
  /haptics
  /theme
  /utils
```

This is a direction, not a prison. Keep the structure clean and minimal.

---

# 16. Data and Logic Design Guidance

## 16.1 Recommended State Shape

The simulation should track:

* current vitals
* active scenario
* active interventions
* elapsed time
* current severity level
* score state
* fail/success flags

## 16.2 Scenario Definitions

Each scenario should define:

* initial vitals
* deterioration curve
* allowed interventions
* success threshold
* fail threshold
* expected duration

## 16.3 Formula Strategy

Use simple formulas.

Example categories:

* natural deterioration over time
* intervention-based deltas
* derived stability scoring
* scenario-specific multipliers

Avoid excessive physiologic depth in v1.

---

# 17. Visual Design Direction

## 17.1 Style

Clinical, modern, dark-theme friendly, high-contrast.

## 17.2 UI Mood

Should feel:

* serious
* sharp
* clean
* tense
* premium

## 17.3 Visual Priorities

* waveform readability
* number readability
* color urgency hierarchy
* button clarity
* minimal clutter

## 17.4 Color Logic

Recommended semantic palette:

* green = stable / acceptable
* amber = warning
* red = critical
* blue = oxygen / support action

Do not overdecorate.

---

# 18. Audio and Haptics Strategy

## 18.1 Audio Purpose

Audio should support:

* urgency
* awareness
* tension
* recovery cues

## 18.2 Sound Types

* monitor beep
* alarm escalation
* intervention confirmation
* stabilization success cue
* failure cue

## 18.3 Haptic Use

Use haptics for:

* successful critical action
* deterioration warning
* failure state

Do not spam haptics.

---

# 19. Persistence Plan

Store locally:

* user settings
* best scores
* scenario unlocks if implemented
* tutorial completion flag

Do not store unnecessary state.

---

# 20. Testing Strategy

## 20.1 Simulation Testing

Test:

* each scenario’s deterioration behavior
* each intervention’s effect
* edge combinations
* fail and success triggers
* timing sensitivity

## 20.2 UX Testing

Test:

* first-run clarity
* readability under stress
* accidental taps
* action discoverability

## 20.3 Technical Testing

Test:

* cold start
* app resume
* persistence integrity
* animation smoothness
* audio toggle behavior
* offline consistency

---

# 21. Risks to Control

## 21.1 Biggest Product Risks

### Risk 1 — Too Realistic

The game becomes difficult to understand and impossible to balance.

### Risk 2 — Too Fake

The product loses credibility and feels like a skin over random numbers.

### Risk 3 — Too Broad

Scope explosion kills momentum.

### Risk 4 — UI Overload

Too many numbers and controls make the experience stressful in a bad way.

### Risk 5 — AI Overbuilding

AI tries to generate a full giant system and creates a messy architecture.

---

# 22. Success Criteria for V1

The product is successful if:

* it runs fully offline
* the core loop is fun and tense
* the medical logic feels believable
* the UI is understandable quickly
* the scenarios feel distinct
* the build is polished enough to present to a client with confidence

---

# 23. Recommended Client Presentation Narrative

Use this framing when presenting:

> PulseLine is an offline mobile emergency stabilization simulation designed to deliver short, high-pressure decision gameplay with medically grounded cause-and-effect. It is intentionally scoped to feel clinically inspired without pretending to replace real training or diagnosis. The first version focuses on a small number of scenarios, strong visual feedback, and a fully self-contained mobile experience.

---

# 24. Disclaimer Guidance

Recommended product disclaimer direction:

> This application is a simulation experience for entertainment and concept demonstration purposes. It is not a medical device, not a diagnostic system, and not a substitute for professional medical training or clinical judgment.

Final legal wording should be reviewed before release.

---

# 25. Final Build Order Summary

The correct order is:

1. lock concept
2. lock simulation rules
3. lock UX structure
4. set up architecture
5. build raw engine
6. build playable UI
7. add feedback systems
8. add persistence
9. tune balance
10. QA
11. prepare client package

Anything outside this order must be justified.

---

# 26. Final Instruction Block for Claude / Codex

Use this exact block when asking an AI to work on the project:

> You are working on an offline React Native medical simulation game. Do not introduce backend systems, online dependencies, or unnecessary features. Work phase by phase only. For the current phase, give me the objective, deliverables, constraints, implementation details, review notes, and exact next step. Keep the medical logic simplified but plausible. Prioritize deterministic behavior, readable UX, performance, and maintainable architecture. Do not try to generate the whole app at once.

---

# 27. Final Instruction for Human Review

Before approving any phase, ask:

* does this still fit the offline-only product goal?
* does this make the app clearer or just bigger?
* does this feel medically plausible without pretending to be clinically authoritative?
* does this help us reach a client-ready product faster?

If the answer is no, reject the addition.

---

# 28. Immediate Next Step

Start with **Phase 0 — Product Lock**.

Do not proceed to code until these are finalized:

* final scenario list
* final intervention list
* final success/failure model
* final V1 exclusions

Only after that should the AI move to **Phase 1 — Simulation Design**.
