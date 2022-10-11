import type { ObjectId } from 'mongodb';
import type { Color } from './Sudoku';

export type GameValues = string[][];
export type Cornermarks = string[][];
export type Centermarks = string[][];
export type Notes = string[][];
export type GameColors = Color[][][];

/** A single step on the way to a solution */
export type SolutionStep = {
  /** Values on the solution step */
  values: GameValues;
  /** Cornermarks on the solution step */
  cornermarks: Cornermarks;
  /** Centermarks on the solution step */
  centermarks: Centermarks;
  /** Notes on the solution step */
  notes: Notes;
  /** A list of colors on each cell */
  colors: GameColors;
};

/** A single step on the way to a solution */
export type WalkthroughStep = {
  /** A description of the logic used etc. */
  description: string;
  /** The actual important step */
  step: SolutionStep;
};

export type Walkthrough = {
  /** The sudoku this walkthrough is made on */
  sudoku_id: ObjectId;
  /** The user that made this walkthrough */
  user_id: ObjectId;
  /** The steps on the way to the solution */
  steps: WalkthroughStep[];
};
