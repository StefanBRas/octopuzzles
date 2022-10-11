import type { SolutionStep } from '$models/Walkthrough';
import deepCopy from '$utils/deepCopy';
import { get, writable } from 'svelte/store';
import { gameHistory } from './sudokuStore';

/**
 * Walkthroughs are gonna work like the gameHistory store,
 * except some of the steps are not there
 * and the steps have descriptions attached to them.
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createWalkthroughStore() {
  const steps = writable<{ description: string; step: SolutionStep }[]>([]);

  function changeDescriptionOfStep(stepIndex: number, newDescription: string): void {
    const currentSteps = deepCopy(get(steps));

    const newSteps = currentSteps.map((step, i) => {
      if (i === stepIndex) {
        step.description = newDescription;
      }
      return step;
    });

    steps.set(newSteps);
  }

  function removeStepFromWalkthrough(stepIndex: number): void {
    const currentSteps = deepCopy(get(steps));

    const newSteps = currentSteps.filter((_, i) => i !== stepIndex);

    steps.set(newSteps);
  }

  function addLatestStepToWalkthrough(): void {
    const currentSteps = deepCopy(get(steps));
    const values = deepCopy(get(gameHistory.getValue('values')));
    const cornermarks = deepCopy(get(gameHistory.getValue('cornermarks')));
    const centermarks = deepCopy(get(gameHistory.getValue('centermarks')));
    const notes = deepCopy(get(gameHistory.getValue('notes')));
    const colors = deepCopy(get(gameHistory.getValue('colors')));

    steps.set([
      ...currentSteps,
      {
        description: '',
        step: {
          values,
          cornermarks,
          centermarks,
          notes,
          colors
        }
      }
    ]);
  }

  return {
    subscribe: steps.subscribe,
    set: steps.set,
    changeDescriptionOfStep,
    removeStepFromWalkthrough,
    addLatestStepToWalkthrough
  };
}

export const walkthroughStore = createWalkthroughStore();
