import type { ObjectId } from 'mongodb';
import type { Color } from './Sudoku';

/** A single step on the way to a solution */
export type SolutionStep = {
  /** Values on the solution step */
  values: string[][];
  /** Cornermarks on the solution step */
  cornermarks: string[][];
  /** Centermarks on the solution step */
  centermarks: string[][];
  /** Notes on the solution step */
  notes: string[][];
  /** A list of colors on each cell */
  colors: Color[][][];
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
