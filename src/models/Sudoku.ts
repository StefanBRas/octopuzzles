import type { ObjectId } from 'mongodb';

export type Margins = {
  /** The width of the left edge of the frame */
  left: number;
  /** The width of the right edge of the frame */
  right: number;
  /** The width of the top edge of the frame */
  top: number;
  /** The width of the bottom edge of the frame */
  bottom: number;
};

export type Dimensions = {
  /** The number of rows in the sudoku */
  rows: number;
  /** The number of columns in the sudoku */
  columns: number;
  /** The margins of the sudoku (for outside clues) */
  margins?: Margins;
};

export type Cornerclue = {
  nw: string;
  ne: string;
  se: string;
  sw: string;
};

export type Color =
  | 'Black'
  | 'White'
  | 'LightGray'
  | 'Gray'
  | 'Orange'
  | 'Purple'
  | 'Red'
  | 'Yellow'
  | 'Green'
  | 'Blue';

export type Position = {
  row: number;
  column: number;
};

export type RegionType = 'Normal' | 'Extra' | 'Clone' | 'MagicSquare';

export type Region = {
  positions: Position[];
  type?: RegionType;
  color?: Color;
  borders?: boolean;
};

export type Line = {
  /** The starting x of the line */
  x1: number;
  /** The starting y of the line */
  y1: number;
  /** The ending x of the line */
  x2: number;
  /** The ending y of the line */
  y2: number;
};

export type CageType = 'Killer';

export type Extendedcage = {
  positions: Position[];
  type?: CageType;
  text?: string;
  color?: Color;
};

export type PathType =
  | 'Arrow'
  | 'Thermo'
  | 'Between'
  | 'Lockout'
  | 'Renban'
  | 'Whisper'
  | 'Palindrome'
  | 'AntiFactor'
  | 'EqualSum'
  | 'Odd'
  | 'Even'
  | 'Pill';

export type Form = 'Square' | 'Round' | 'Diamond';

export type Fill = 'Solid' | 'Hollow';

export type Path = {
  positions: Position[];
  type?: PathType;
  color?: Color;
  width?: number; // up to 100%
  form?: Form;
  fill?: Fill;
  arrow?: boolean;
};

export type BorderClueType =
  | 'KropkiWhite'
  | 'KropkiBlack'
  | 'XvX'
  | 'XvV'
  | 'Inequality'
  | 'Quadruple'
  | 'Border';

export type Shape = 'Circle' | 'Square' | 'Diamond' | 'Star' | 'Line';

export type Borderclue = {
  positions: [Position, Position];
  type?: BorderClueType;
  shape?: Shape;
  color?: Color;
  radius?: number; // up to 100%
  text?: string;
};

export type CellClueType =
  | 'Maximum'
  | 'Minimum'
  | 'LittleKillerNE'
  | 'LittleKillerSE'
  | 'LittleKillerSW'
  | 'LittleKillerNW'
  | 'Sandwich'
  | 'Skyscraper'
  | 'XSum'
  | 'NumberedRoom';

export type CellClueLocation =
  | 'TopLeft'
  | 'Top'
  | 'TopRight'
  | 'Left'
  | 'Center'
  | 'Right'
  | 'BottomLeft'
  | 'Bottom'
  | 'BottomRight';

export type CellClueSize = 'Large' | 'Medium' | 'Small' | 'XSmall';

export type SymbolType = 'Arrowhead' | 'InvertedArrowhead' | 'Arrow' | 'SmallArrow' | 'Diagonal';

export type Rotation =
  | 'North'
  | 'NorthEast'
  | 'East'
  | 'SouthEast'
  | 'South'
  | 'SouthWest'
  | 'West'
  | 'NorthWest';

export type Cellclue = {
  position: Position;
  type?: CellClueType;
  location?: CellClueLocation;
  text?: string;
  size?: CellClueSize;
  symbol?: SymbolType;
  rotation?: Rotation;
  color?: Color;
};

export type LogicFlag =
  | 'NonStandard'
  | 'DiagonalPos'
  | 'DiagonalNeg'
  | 'Antiknight'
  | 'Antiking'
  | 'Nonconsecutive'
  | 'DisjointSets'
  | 'SCells'
  | 'Entropy'
  | 'Indexed159'
  | 'NegativeX'
  | 'NegativeV'
  | 'NegativeBlack'
  | 'NegativeWhite';

export type Logic = {
  /** the valid digits expected in the puzzle, as a comma separated list of ranges (num or alpha). If None, defaults to 1-9 */
  digits?: string;
  flags?: LogicFlag[];
};

export type SudokuSymbol = {
  type: SymbolType;
  rotation: Rotation;
  color: Color;
};

export type Cells = boolean[][];
export type Givens = string[][];
export type Cornerclues = (Cornerclue | null)[][];
export type EditorColors = (Color | null)[][];
export type Regions = Region[];
export type Borders = Line[];
export type KillerCages = Position[][];
export type Extendedcages = Extendedcage[];
export type Paths = Path[];
export type Borderclues = Borderclue[];
export type Cellclues = Cellclue[];
export type SudokuSymbols = (SudokuSymbol[] | null)[][];
export type Solution = string[][];

export type Sudoku = {
  /** The id of the user who created the sudoku */
  user_id?: ObjectId;
  /** When this sudoku became public */
  public_since?: Date;
  /** The title of the sudoku */
  title: string;
  /** The description of the sudoku, e.g. rules, etc. */
  description: string;
  /** The upvotes minus the downvotes */
  points: number;
  /** The calculated points the sudoku has gotten from upvotes/downvotes using the ranking algorithm */
  rank: number;
  /** The dimensions of the sudoku, i.e. the number of rows and columns */
  dimensions: Dimensions;
  /** The cells that are interactable in the sudoku. */
  cells: Cells;
  /** The givens in the sudoku.  */
  givens: Givens;
  /** OBSOLETE: The cornerclues in the sudoku. Migrated to Cellclues when the puzzle is loaded in the client */
  cornerclues?: Cornerclues;
  /** The colors in the cells of the sudoku. */
  colors: EditorColors;
  /** The regions of the sudoku. */
  regions?: Regions;
  /** OBSOLETE: The borders of the sudoku. */
  borders?: Borders;
  /** OBSOLETE: The dotted boxes (killer cages) in the grid. Migrated to Extendedcages when the puzzle is loaded in the client */
  killercages?: KillerCages;
  /** The dotted boxes (killer cages) in the grid, with optional rendering settings */
  extendedcages?: Extendedcages;
  /** The paths in the sudoku, i.e. thermometers, etc. */
  paths: Paths;
  /** The borderclues of the sudoku. That is, a clue lying on a border. If null, there are no border clues */
  borderclues: Borderclues;
  /** The cellclues of the sudoku. That is, a clue contained within a cell. If null, there are no cell clues */
  cellclues?: Cellclues;
  /** OBSOLETE: The symbols in the grid. If null, there are no symbols */
  symbols?: SudokuSymbols;
  /** The global sudoku logic in the grid. */
  logic?: Logic;
  /** The solution to the puzzle if any is given */
  solution?: Solution;
  /** A list of labels on this sudoku */
  labels: ObjectId[];
  /** The time when the user was created */
  created_at: Date;
  /** The last time the user was updated */
  updated_at: Date;
};
