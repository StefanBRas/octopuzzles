import type { Solution, Sudoku, SudokuClues } from '$models/Sudoku';
import type { SolutionStep } from '$models/Walkthrough';

export type Mode = 'editor' | 'game';

type NoUndefinedField<T> = { [P in keyof T]-?: NonNullable<T[P]> };

export type PlayableSudoku = NoUndefinedField<
  Omit<Sudoku, 'userId' | 'publicSince' | 'solution'>
> & {
  userId: number | null;
  publicSince: Date | null;
  solution: Solution | null;
};

export type EditorHistoryStep = NoUndefinedField<SudokuClues>;

export type GameHistoryStep = SolutionStep;

export type InputMode = keyof EditorHistoryStep | keyof GameHistoryStep;

/**
 * Either some type or a number to indicate the index where the previous clue lies
 */
type WithNumbers<Type> = {
  [Property in keyof Type]: Type[Property] | number;
};

export type EditorHistoryStepWithNumbers = WithNumbers<EditorHistoryStep>;
export type GameHistoryStepWithNumbers = WithNumbers<GameHistoryStep>;
