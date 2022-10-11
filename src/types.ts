import type {
  Borderclues,
  Cellclues,
  Cells,
  Dimensions,
  EditorColors,
  Extendedcages,
  Givens,
  Logic,
  Paths,
  Regions
} from '$models/Sudoku';
import type { SolutionStep } from '$models/Walkthrough';

export type Mode = 'editor' | 'game';

export type EditorHistoryStep = {
  cages: Extendedcages;
  regions: Regions;
  editorcolors: EditorColors;
  givens: Givens;
  paths: Paths;
  borderclues: Borderclues;
  cellclues: Cellclues;
  dimensions: Dimensions;
  cells: Cells;
  logic: Logic;
};

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
