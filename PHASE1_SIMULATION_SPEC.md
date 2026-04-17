# Phase 1 — Simulation Design Spec

This document defines the complete medical-game logic for PulseLine V1.
It is written spec only — no code. Every rule must be unambiguous before Phase 3 implementation begins.

---

## 1. Vital Signs State Model

### 1.1 Tracked Vitals

| Vital | Abbreviation | Normal Range | Unit |
|---|---|---|---|
| Heart Rate | HR | 60–100 | bpm |
| Systolic Blood Pressure | SBP | 90–140 | mmHg |
| Diastolic Blood Pressure | DBP | 60–90 | mmHg |
| Oxygen Saturation | SpO₂ | 95–100 | % |
| Rhythm | RHY | sinus / tachy / vfib | enum |
| Stability Score | SS | 0–100 | derived |

### 1.2 Rhythm States

| State | Meaning |
|---|---|
| `sinus` | Normal sinus rhythm |
| `tachy` | Tachyarrhythmia — fast, disorganized |
| `vfib` | Ventricular fibrillation — critical, fatal if untreated |

### 1.3 Stability Score (SS)

SS is derived each tick from the current vitals. It is not directly editable.

```
SS = 100
   − penalty_HR
   − penalty_SBP
   − penalty_SpO2
   − rhythm_penalty
```

**HR penalties:**

| Condition | Penalty |
|---|---|
| HR 101–130 | −10 |
| HR 131–160 | −20 |
| HR > 160 | −35 |
| HR < 50 | −25 |

**SBP penalties:**

| Condition | Penalty |
|---|---|
| SBP 80–89 | −15 |
| SBP < 80 | −35 |
| SBP > 160 | −10 |

**SpO₂ penalties:**

| Condition | Penalty |
|---|---|
| SpO₂ 90–94 | −10 |
| SpO₂ 85–89 | −25 |
| SpO₂ < 85 | −40 |

**Rhythm penalties:**

| Condition | Penalty |
|---|---|
| `tachy` | −10 |
| `vfib` | −50 |

SS is clamped to [0, 100].

### 1.4 Severity Tiers

| SS Range | State |
|---|---|
| 75–100 | Stable |
| 50–74 | Warning |
| 25–49 | Critical |
| 0–24 | Failing |

---

## 2. Tick System

- Tick rate: **1 tick = 1 real second**
- Deterioration applies passively every tick
- Active interventions modify vitals during their duration window
- SS is recalculated at the end of every tick

---

## 3. Deterioration Rules

### 3.1 Scenario 1 — Tachyarrhythmia

| Condition | Effect per tick |
|---|---|
| Untreated baseline | HR +2 bpm |
| HR > 150 sustained 10s | Rhythm → `tachy` |
| HR > 180 sustained 10s | Rhythm → `vfib` |
| HR > 140 | SBP −1 mmHg/tick |
| HR > 160 | SpO₂ −0.5%/tick |

### 3.2 Scenario 2 — Hypoxemia

| Condition | Effect per tick |
|---|---|
| Untreated baseline | SpO₂ −1%/tick |
| SpO₂ < 90 sustained 8s | HR +3/tick |
| SpO₂ < 85 sustained 5s | SBP −2/tick |
| SpO₂ < 80 sustained 6s | Rhythm → `tachy` (deterministic) |

### 3.3 Scenario 3 — Hypotensive Shock

| Condition | Effect per tick |
|---|---|
| Untreated baseline | SBP −2 mmHg/tick |
| SBP < 80 sustained 10s | HR +3/tick |
| SBP < 70 sustained 8s | SpO₂ −1%/tick |
| SBP < 60 sustained 6s | Rhythm → `tachy` (deterministic) |

---

## 4. Intervention Rules

### 4.1 Oxygen

| Property | Value |
|---|---|
| Eligible when | SpO₂ < 95 |
| Effect | SpO₂ +2%/tick for 10 ticks |
| Cooldown | 15s |
| Downside | If SpO₂ drop is cardiac-origin (Scenario 3): only +0.5%/tick |
| Available in | All 3 scenarios |

### 4.2 IV Fluids

| Property | Value |
|---|---|
| Eligible when | SBP < 100 |
| Effect | SBP +3 mmHg/tick for 8 ticks |
| Cooldown | 20s |
| Downside | If HR > 140: only +1 mmHg/tick |
| Risk | If SBP > 120 on use: SBP +10 mmHg flat overshoot |
| Available in | Scenarios 2 and 3 |

### 4.3 Rate-Control (Beta-blocker)

| Property | Value |
|---|---|
| Eligible when | HR > 110 |
| Effect | HR −5/tick for 8 ticks |
| Cooldown | 25s |
| Downside | SBP −3 mmHg flat on use |
| Risk | If SBP < 90 on use: SBP −8 mmHg flat instead |
| Available in | Scenarios 1 and 2 |

### 4.4 Synchronized Cardioversion

| Property | Value |
|---|---|
| Eligible when | Rhythm = `tachy` AND HR > 150 |
| Effect | HR reset to 90, Rhythm reset to `sinus` |
| Cooldown | 45s |
| Downside | SBP −10 mmHg flat on use |
| Risk | If Rhythm = `sinus` (misapplied): SBP −20 mmHg flat, HR drops to 55 |
| Available in | Scenario 1 (primary); available but high-risk in Scenario 2 |

---

## 5. Fail and Success Conditions

### 5.1 Fail Conditions

Any one of the following triggers game over:

| Condition | Duration |
|---|---|
| SS = 0 | 5 consecutive ticks |
| Rhythm = `vfib` | 10 consecutive ticks |
| SBP < 50 | 8 consecutive ticks |
| SpO₂ < 70 | 6 consecutive ticks |
| Time limit exceeded | Scenario-specific |

### 5.2 Success Condition

SS ≥ 75 sustained for **15 consecutive ticks** = patient stabilized.

---

## 6. Scoring

| Factor | Points |
|---|---|
| Base stabilization | +1000 |
| Time bonus | +10 per second under par time |
| Correct intervention | +150 each |
| Harmful/misapplied intervention | −200 each |
| Near-death recovery (SS < 25 → ≥ 75) | +300 |

Score is uncapped but bounded by scenario par time and intervention count.

---

## 7. Scenario Initial States

### 7.1 Scenario 1 — Tachyarrhythmia

| Vital | Start Value |
|---|---|
| HR | 145 bpm |
| SBP | 105 mmHg |
| DBP | 70 mmHg |
| SpO₂ | 93% |
| Rhythm | `tachy` |
| SS | ~55 (Warning) |
| Time limit | 90 seconds |
| Par time | 60 seconds |

Correct path: Rate-Control first, then Cardioversion if HR stays high, Oxygen to support SpO₂.

### 7.2 Scenario 2 — Hypoxemia

| Vital | Start Value |
|---|---|
| HR | 108 bpm |
| SBP | 112 mmHg |
| DBP | 74 mmHg |
| SpO₂ | 86% |
| Rhythm | `sinus` |
| SS | ~50 (Warning) |
| Time limit | 90 seconds |
| Par time | 55 seconds |

Correct path: Oxygen immediately. If HR rises above 110, Rate-Control. Fluids not indicated unless SBP drops.

### 7.3 Scenario 3 — Hypotensive Shock

| Vital | Start Value |
|---|---|
| HR | 118 bpm |
| SBP | 78 mmHg |
| DBP | 50 mmHg |
| SpO₂ | 91% |
| Rhythm | `sinus` |
| SS | ~45 (Critical) |
| Time limit | 120 seconds |
| Par time | 75 seconds |

Correct path: IV Fluids immediately. Oxygen if SpO₂ worsens. Avoid Rate-Control (worsens hypotension). Cardioversion is a trap here.

---

## 8. Design Constraints

- All deterioration is fully deterministic — rhythm transitions trigger after a sustained threshold duration, never by probability
- No intervention stacking — applying the same intervention twice before cooldown is blocked by the UI
- Vitals are floats internally, displayed as integers on screen
- DBP is tracked but not shown prominently — it is used only in SS derivation as a secondary signal in future phases (V1 may display SBP only)

---

## 9. Review Notes

- All rhythm transitions are now deterministic threshold-based — failure always feels deserved, never random
- Cardioversion SBP penalty (-10) makes it risky to use if SBP is already borderline — this is intentional and creates meaningful decision pressure
- Rate-Control in Scenario 3 is available but harmful — the UI should not hide it, but the scoring should penalize misuse
- SS formula weights should be validated in Phase 4 against all three scenario start states to confirm they land in the expected tier

---

## 10. Phase 1 Acceptance Criteria

- [x] Every gameplay action has a predictable effect
- [x] The system can be played through on paper for all 3 scenarios
- [x] No contradictory rules exist
- [x] Fail and success conditions are unambiguous
- [x] Scoring logic is complete

---

## Next Step

**Phase 2 — UX and Screen Architecture**

Define navigation structure, screen purposes, monitor layout, controls layout, results screen, and first-run guidance. No final visuals or brand polish yet.
