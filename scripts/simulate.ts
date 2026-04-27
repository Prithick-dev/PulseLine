import {initSimulation, tick, applyIntervention} from '../src/simulation/engine';
import {ScenarioId, InterventionId} from '../src/simulation/types';

function pad(s: string, n: number) { return s.padEnd(n); }

function logTick(t: number, state: ReturnType<typeof initSimulation>) {
  const v = state.vitals;
  const s = state.stability;
  console.log(
    `t=${String(t).padStart(3)} | HR=${String(Math.round(v.hr)).padStart(3)} SBP=${String(Math.round(v.sbp)).padStart(3)} SpO2=${String(Math.round(v.spo2)).padStart(3)} RHY=${pad(v.rhythm, 5)} | SS=${String(Math.round(s.score)).padStart(3)} ${pad(s.tier, 8)} | Score=${state.score}`
  );
}

function run(scenarioId: ScenarioId, label: string, plan: {tick: number; id: InterventionId}[]) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`SCENARIO: ${scenarioId} — ${label}`);
  console.log('='.repeat(80));

  let state = initSimulation(scenarioId);
  logTick(0, state);

  const planMap = new Map<number, InterventionId[]>();
  for (const p of plan) {
    const arr = planMap.get(p.tick) || [];
    arr.push(p.id);
    planMap.set(p.tick, arr);
  }

  for (let t = 1; t <= state.timeLimitSeconds; t++) {
    const actions = planMap.get(t);
    if (actions) {
      for (const id of actions) {
        const before = state.correctActions;
        state = applyIntervention(state, id);
        const status = state.correctActions > before ? 'CORRECT' : 'HARMFUL/BLOCKED';
        console.log(`  >> APPLY ${id} at t=${t} — ${status}`);
      }
    }
    state = tick(state);
    logTick(t, state);
    if (state.outcome) {
      console.log(`>>> OUTCOME at t=${t}: ${state.outcome} | Score: ${state.score}`);
      break;
    }
  }
}

// Scenario 1: rate-control → cardioversion → iv_fluids → oxygen
run('tachyarrhythmia', 'CORRECT PATH', [
  {tick: 2, id: 'rate_control'},     // slow HR from 149→ -5/tick
  {tick: 10, id: 'cardioversion'},   // reset HR=90 rhythm=sinus, SBP -10
  {tick: 11, id: 'iv_fluids'},       // SBP recovery
  {tick: 15, id: 'oxygen'},          // SpO2 support
]);

// Scenario 2: oxygen → oxygen again → rate-control when HR rises
run('hypoxemia', 'CORRECT PATH', [
  {tick: 2, id: 'oxygen'},
  {tick: 15, id: 'oxygen'},
  {tick: 16, id: 'rate_control'},
]);

// Scenario 3: iv_fluids → oxygen → iv_fluids again
run('hypotensive_shock', 'CORRECT PATH', [
  {tick: 2, id: 'iv_fluids'},
  {tick: 12, id: 'oxygen'},
  {tick: 24, id: 'iv_fluids'},
]);

// Scenario 4: guided breathing early, oxygen only if saturation starts slipping
run('panic_attack', 'CORRECT PATH', [
  {tick: 2, id: 'guided_breathing'},
]);

// Scenario 5: glucose immediately
run('critical_hypoglycemia', 'CORRECT PATH', [
  {tick: 2, id: 'glucose'},
]);
