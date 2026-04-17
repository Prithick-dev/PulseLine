// Game store — holds active simulation state
// The simulation engine writes here; the UI reads from here

import {create} from 'zustand';
import {SimulationState} from '../simulation/types';

interface GameStore {
  simulation: SimulationState | null;
  setSimulation: (state: SimulationState) => void;
  clearSimulation: () => void;
}

export const useGameStore = create<GameStore>(set => ({
  simulation: null,
  setSimulation: (state: SimulationState) => set({simulation: state}),
  clearSimulation: () => set({simulation: null}),
}));
