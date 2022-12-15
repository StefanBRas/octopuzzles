import { getContext } from 'svelte';
import type { createEditorHistoryStore, createGameHistoryStore } from '$stores/sudokuStore';
import type { PlayableSudoku } from '$types';
import type { Writable } from 'svelte/store';

export const SUDOKU_EDITOR_CONTEXT_KEY = 'sudokuEditor';
/**
 * Gets the context having the state of the sudoku editor
 */
export const getSudokuEditorContext = (): ReturnType<typeof createEditorHistoryStore> => {
  return getContext(SUDOKU_EDITOR_CONTEXT_KEY);
};

export const SUDOKU_GAME_CONTEXT_KEY = 'sudokuGame';
/**
 * Gets the context having the state of the current solve
 */
export const getSudokuGameContext = (): ReturnType<typeof createGameHistoryStore> => {
  return getContext(SUDOKU_GAME_CONTEXT_KEY);
};

export const SUDOKU_BEING_PLAYED_CONTEXT_KEY = 'sudokuBeingPlayed';
/**
 * Gets the current sudoku that is being solved/played
 */
export const getSudokuBeingPlayedContext = (): PlayableSudoku => {
  return getContext(SUDOKU_BEING_PLAYED_CONTEXT_KEY);
};
