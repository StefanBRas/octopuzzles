import type { Sudoku } from '$models/Sudoku';
import type { SolutionStep } from '$models/Walkthrough';

export type Mode = 'editor' | 'game';

type NoUndefinedField<T> = { [P in keyof T]-?: NonNullable<T[P]> };

export type EditorHistoryStep = NoUndefinedField<
  Omit<
    Sudoku,
    | 'id'
    | 'userId'
    | 'publicSince'
    | 'title'
    | 'description'
    | 'points'
    | 'rank'
    | 'createdAt'
    | 'updatedAt'
    | 'solution'
  >
>;

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
