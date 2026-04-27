import {applyIntervention, initSimulation, tick} from '../src/simulation/engine';
import {InterventionId, ScenarioId} from '../src/simulation/types';

function runScenario(
  scenarioId: ScenarioId,
  plan: Array<{tick: number; id: InterventionId}>,
) {
  let state = initSimulation(scenarioId);
  const planMap = new Map<number, InterventionId[]>();

  for (const step of plan) {
    const actions = planMap.get(step.tick) ?? [];
    actions.push(step.id);
    planMap.set(step.tick, actions);
  }

  for (let second = 1; second <= state.timeLimitSeconds; second += 1) {
    const actions = planMap.get(second) ?? [];

    for (const id of actions) {
      state = applyIntervention(state, id);
    }

    state = tick(state);
    if (state.outcome) {
      break;
    }
  }

  return state;
}

describe('simulation engine expansions', () => {
  it('stabilizes panic attack with guided breathing', () => {
    const state = runScenario('panic_attack', [
      {tick: 2, id: 'guided_breathing'},
    ]);

    expect(state.outcome).toBe('stabilized');
    expect(state.correctActions).toBe(1);
    expect(state.harmfulActions).toBe(0);
  });

  it('treats rate control as a harmful trap in panic attack', () => {
    const state = applyIntervention(initSimulation('panic_attack'), 'rate_control');

    expect(state.correctActions).toBe(0);
    expect(state.harmfulActions).toBe(1);
    expect(state.vitals.sbp).toBeLessThan(164);
  });

  it('stabilizes critical hypoglycemia with glucose', () => {
    const state = runScenario('critical_hypoglycemia', [
      {tick: 2, id: 'glucose'},
    ]);

    expect(state.outcome).toBe('stabilized');
    expect(state.correctActions).toBe(1);
    expect(state.harmfulActions).toBe(0);
  });
});
