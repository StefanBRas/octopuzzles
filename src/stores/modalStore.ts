import type { SvelteComponent, SvelteComponentTyped } from 'svelte';
import { get, writable } from 'svelte/store';

export const exitBeforeEnter = writable(false);

/**
 * The transition state of the modals
 */
export const transitioning = writable<boolean | null>(null);

/**
 * A Svelte store containing the current modal stack
 */
export const modals = writable<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Array<{ component: new (...args: any) => SvelteComponent; props?: unknown }>
>([]);

/**
 * A Svelte store describing how the current modal came to be active ("push" or "pop").
 * This can be useful for transitions if they should animate differently based on the action.
 */
export const action = writable<null | 'push' | 'pop'>(null);

/**
 * Closes all modals in the stack
 */
export function closeAllModals(): void {
  modals.set([]);
}

/**
 * Closes the last `amount` of modals in the stack
 */
export function closeModals(amount = 1): void {
  if (get(transitioning)) {
    return;
  }

  const modalsLength = get(modals).length;
  if (get(exitBeforeEnter) && modalsLength > 0) {
    transitioning.set(true);
  }
  exitBeforeEnter.set(false);

  action.set('pop');

  pop(amount);
}

/**
 * Closes the current modal component
 */
export function closeModal(): void {
  return closeModals(1);
}

/**
 * Opens a new modal
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function openModal<T extends Record<string, any>>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: new (...args: any) => SvelteComponentTyped<T>,
  props?: Omit<T, 'isOpen'>,
  options?: {
    /**
     * This modal will replace the last modal in the stack
     */
    replace?: boolean;
  }
): void {
  if (get(transitioning)) {
    return;
  }

  action.set('push');

  if (get(exitBeforeEnter) && get(modals).length) {
    transitioning.set(true);
  }
  exitBeforeEnter.set(false);

  if (options?.replace) {
    modals.update((prev) => [...prev.slice(0, prev.length - 1), { component, props }]);
  } else {
    modals.update((prev) => [...prev, { component, props }]);
  }
}

function pop(amount = 1): void {
  modals.update((prev) => prev.slice(0, Math.max(0, prev.length - amount)));
}

export function hasOpenModals(): boolean {
  return get(modals).length > 0;
}
