import { derived, get, writable } from 'svelte/store';
import type { Readable } from 'svelte/store';
import deepCopy from '$utils/deepCopy';
import {
  defaultBorderclues,
  defaultCellclues,
  defaultCells,
  defaultCentermarks,
  defaultNotes,
  defaultCornermarks,
  defaultEditorColors,
  defaultGameColors,
  defaultGivens,
  defaultCages,
  defaultPaths,
  defaultValues,
  defaultLogic,
  defaultRegions
} from '$utils/defaults';
import {
  defaultHandleArrows,
  defaultHandleMouseDown,
  defaultHandleMouseEnter
} from './interactionHandlers';
import type { ArrowHandler, MouseDownHandler, MouseEnterHandler } from './interactionHandlers';
import type { Label } from '$models/Label';
import type { Position, Margins, Dimensions } from '$models/Sudoku';
import type {
  EditorHistoryStep,
  EditorHistoryStepWithNumbers,
  GameHistoryStep,
  InputMode,
  Mode
} from '$types';

// WRITABLES
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createEditorHistoryStore() {
  // Step
  const step = writable(0);
  // History
  const history = writable<EditorHistoryStepWithNumbers[]>([
    {
      givens: defaultGivens(),
      extendedcages: defaultCages(),
      colors: defaultEditorColors(),
      paths: defaultPaths(),
      borderclues: defaultBorderclues(),
      cellclues: defaultCellclues(),
      dimensions: { rows: 9, columns: 9, margins: undefined },
      cells: defaultCells(),
      regions: defaultRegions(),
      logic: defaultLogic()
    }
  ]);
  const title = writable('');
  const description = writable('');
  const labels = writable<{ label: Label; selected: boolean }[]>([]);

  /**
   * Increase the editor step by one, and specify what changes have been made to the editor since last step. Will keep the state of the non-changed items
   */
  function set(newClues: Partial<EditorHistoryStepWithNumbers>): void {
    const localHistory = deepCopy(get(history));
    const localStep = deepCopy(get(step));
    const newHistory = deepCopy(localHistory.slice(0, localStep + 1));
    const newStep = deepCopy(localHistory[localStep]);
    if (newStep == null) return;
    for (const [key] of Object.entries(newStep)) {
      const k = key as keyof EditorHistoryStep;
      if (typeof newStep[k] !== 'number') {
        newStep[k] = localStep;
      }
    }
    newClues = Object.fromEntries(Object.entries(newClues).filter(([, value]) => !!value));
    Object.assign(newStep, newClues);
    history.set([...newHistory, newStep]);
    step.update((step) => step + 1);
  }

  /**
   * Get the state of the editor at the current step.
   * @example
   * // To get the current killercages
   * const killercages = getEditorState.subscribeToClue("killercages");
   */
  function subscribeToClue<T extends keyof EditorHistoryStep>(
    type: T
  ): Readable<EditorHistoryStep[T]> {
    return derived([history, step], ([$editorHistory, $editorStep]) => {
      const res = $editorHistory[$editorStep]?.[type];
      if (typeof res === 'number') {
        return $editorHistory[res]?.[type] as EditorHistoryStep[T];
      } else {
        return res as EditorHistoryStep[T];
      }
    });
  }

  /**
   * Gets a single clue
   */
  function getClue<T extends keyof EditorHistoryStep>(type: T): EditorHistoryStep[T] {
    const localHistory = get(history);
    const res = localHistory[get(step)]?.[type];
    if (typeof res === 'number') {
      return localHistory[res]?.[type] as EditorHistoryStep[T];
    } else {
      return res as EditorHistoryStep[T];
    }
  }

  /**
   * Gets all the clues
   */
  function getClues(): EditorHistoryStep {
    const localHistory = get(history);
    const res = localHistory[get(step)];
    for (const [key, value] of Object.entries(res)) {
      const k = key as keyof EditorHistoryStep;
      if (typeof value === 'number') {
        res[k] = localHistory[value][k] as any;
      }
    }

    return res as EditorHistoryStep;
  }

  /**
   * Undo a step in the editor
   */
  function undo(): void {
    step.update((oldStep) => Math.max(0, oldStep - 1));
  }

  const canUndo = derived(step, ($step) => $step > 0);

  function redo(): void {
    step.update((step) => Math.min(get(history).length, step + 1));
  }

  const canRedo = derived([history, step], ([$history, $step]) => $step < $history.length - 1);

  /** Reset the editor */
  function reset(startState?: Partial<EditorHistoryStep>): void {
    const dim: Dimensions = startState?.dimensions || { rows: 9, columns: 9, margins: undefined };
    step.set(0);
    history.set([
      {
        givens: startState?.givens || defaultGivens(dim),
        extendedcages: startState?.extendedcages || defaultCages(),
        colors: startState?.colors || defaultEditorColors(dim),
        paths: startState?.paths || defaultPaths(),
        borderclues: startState?.borderclues || defaultBorderclues(),
        cellclues: startState?.cellclues || defaultCellclues(),
        dimensions: dim,
        cells: startState?.cells || defaultCells(dim),
        regions: startState?.regions || defaultRegions(dim),
        logic: startState?.logic || defaultLogic()
      }
    ]);
  }

  /** Clear every input-values, and colors from the specified cells in the editor */
  function clearCells(cells: Position[]): void {
    const newGivens = getClue('givens');
    const newColors = getClue('colors');
    let changes = false;
    cells.forEach((cell) => {
      let newGiven = newGivens[cell.row]?.[cell.column];
      if (newGiven !== '') {
        changes = true;
        newGiven = '';
      }
      let newColor = newColors[cell.row]?.[cell.column];
      if (newColor != null) {
        changes = true;
        newColor = null;
      }
    });
    if (changes) {
      set({
        givens: newGivens,
        colors: newColors
      });
    }
  }

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clearCells,
    set,
    subscribeToClue,
    getClue,
    getClues,
    title,
    description,
    labels
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createGameHistoryStore() {
  // Step
  const step = writable(0);
  // History
  const history = writable<GameHistoryStep[]>([
    {
      values: defaultValues(),
      colors: defaultGameColors(),
      cornermarks: defaultCornermarks(),
      centermarks: defaultCentermarks(),
      notes: defaultNotes()
    }
  ]);

  /**
   * Increase the editor step by one, and specify what changes have been made to the editor since last step. Will keep the state of the non-changed items
   */
  function set(newValues: Partial<GameHistoryStep>): void {
    const localHistory = deepCopy(get(history));
    const localStep = deepCopy(get(step));
    const newHistory = deepCopy(localHistory.slice(0, localStep + 1));
    const newStep = deepCopy(localHistory[localStep]);
    if (newHistory == null || newStep == null) return;
    Object.assign(newStep, newValues);
    history.set([...newHistory, newStep]);
    step.update((s) => s + 1);
  }

  /**
   * Get the state of the editor at the current step.
   * @example
   * // To get the current killercages
   * const killercages = getEditorState("killercages");
   */
  function subscribeToValue<T extends keyof GameHistoryStep>(
    type: T
  ): Readable<GameHistoryStep[T]> {
    return derived([history, step], ([$gameHistory, $gameStep]) => {
      const res = $gameHistory[$gameStep]?.[type];
      if (typeof res === 'number') {
        return $gameHistory[res]?.[type] as GameHistoryStep[T];
      } else {
        return res as GameHistoryStep[T];
      }
    });
  }

  function getValue<T extends keyof GameHistoryStep>(type: T): GameHistoryStep[T] {
    const localHistory = get(history);
    const res = localHistory[get(step)]?.[type];
    if (typeof res === 'number') {
      return localHistory[res]?.[type] as GameHistoryStep[T];
    } else {
      return res as GameHistoryStep[T];
    }
  }

  /**
   * Gets all the clues
   */
  function getValues(): GameHistoryStep {
    const localHistory = get(history);
    const res = localHistory[get(step)];
    for (const [key, value] of Object.entries(res)) {
      const k = key as keyof GameHistoryStep;
      if (typeof value === 'number') {
        res[k] = localHistory[value][k] as any;
      }
    }

    return res as GameHistoryStep;
  }

  /**
   * Undo a step in the editor
   */
  function undo(): void {
    step.update((oldStep) => Math.max(0, oldStep - 1));
  }

  const canUndo = derived(step, ($step) => $step > 0);

  function redo(): void {
    step.update((step) => Math.min(get(history).length, step + 1));
  }

  const canRedo = derived([history, step], ([$history, $step]) => $step < $history.length - 1);

  /** Reset the game */
  function reset(dimensions: Dimensions): void {
    selectedItemIndex.set(-1);
    highlightedItemIndex.set(-1);
    selectedCells.set([]);
    highlightedCells.set([]);
    step.set(0);
    history.set([
      {
        values: defaultValues(dimensions),
        colors: defaultGameColors(dimensions),
        cornermarks: defaultCornermarks(dimensions),
        centermarks: defaultCentermarks(dimensions),
        notes: defaultNotes(dimensions)
      }
    ]);
  }

  /** Clear every input-values, and colors from the specified cells in the editor */
  function clearCells(cells: Position[]): void {
    const newValues = getValue('values');
    const newCornerMarks = getValue('cornermarks');
    const newCenterMarks = getValue('centermarks');
    const newColors = getValue('colors');
    let changes = false;
    cells.forEach((cell) => {
      if (newValues[cell.row]?.[cell.column] !== '') {
        changes = true;
        newValues[cell.row][cell.column] = '';
      }
      if (newCornerMarks[cell.row][cell.column] !== '') {
        changes = true;
        newCornerMarks[cell.row][cell.column] = '';
      }
      if (newCenterMarks[cell.row][cell.column] !== '') {
        changes = true;
        newCenterMarks[cell.row][cell.column] = '';
      }
      if (newColors[cell.row][cell.column] != null) {
        changes = true;
        newColors[cell.row][cell.column] = [];
      }
    });
    if (changes) {
      set({
        values: newValues,
        cornermarks: newCornerMarks,
        centermarks: newCenterMarks,
        colors: newColors
      });
    }
  }

  return {
    undo,
    redo,
    canUndo,
    canRedo,
    reset,
    clearCells,
    set,
    subscribeToValue,
    getValue,
    getValues
  };
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createInputModeStore() {
  const { subscribe, set } = writable<InputMode | null>(null);

  return {
    subscribe,
    set: (value: InputMode | null) => {
      selectedItemIndex.set(-1);
      highlightedItemIndex.set(-1);
      handleArrows.set(defaultHandleArrows);
      handleMouseDown.set(defaultHandleMouseDown);
      handleMouseEnter.set(defaultHandleMouseEnter);
      set(value);
    }
  };
}

export const mode = writable<Mode>('game');
export const inputMode = createInputModeStore();
export const selectedItemIndex = writable(-1);
export const highlightedItemIndex = writable(-1);
/** Cells with wrong solutions */
export const wrongCells = writable<Position[]>([]);

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createSelectedCellsStore() {
  const { subscribe, set: _set, update: _update } = writable<Position[]>([]);

  function set(newSelectedCells: Position[]): void {
    selectedItemIndex.set(-1);
    highlightedItemIndex.set(-1);
    highlightedCells.set([]);
    _set(newSelectedCells);
  }

  function addCell(cell: Position, keepIfAlreadySelected = true): void {
    let found = false;
    _update((oldSelectedCells) => {
      const newSelectedCells = oldSelectedCells.filter((c) => {
        if (c.row === cell.row && c.column === cell.column) {
          found = true;
          return keepIfAlreadySelected;
        } else {
          return true;
        }
      });
      if (!found) {
        return [...newSelectedCells, cell];
      }
      return newSelectedCells;
    });
  }

  return {
    subscribe,
    set,
    addCell
  };
}

/**
 * A list of selected cells.
 * A selected cell is one that is pressed on with e.g. the mouse
 */
export const selectedCells = createSelectedCellsStore();
/**
 * A list of highlighted cells.
 * A highlighted cell is e.g. a hovered cell.
 */
export const highlightedCells = writable<Position[]>([]);

/**
 * The controller components can augment the functionality and how user inputs should be handled by changing this function.
 * This function specifies what to do when a user clicks a cell.
 */
export const handleMouseDown = writable<MouseDownHandler>(defaultHandleMouseDown);
/**
 * The controller components can augment the functionality and how user inputs should be handled by changing this function.
 * This function specifies what to do when a user enters a cell with their mouse and the meta button is clicked.
 */
export const handleMouseEnter = writable<MouseEnterHandler>(defaultHandleMouseEnter);
/**
 * The controller components can augment the functionality and how user inputs should be handled by changing this function.
 * This function specifies what to do when a user moves around the board with the arrow buttons.
 */
export const handleArrows = writable<ArrowHandler>(defaultHandleArrows);

export function setMargins(margins?: Margins | null): void {
  const dimensions = editorHistory.getClue('dimensions');
  const borderclues = editorHistory.getClue('borderclues');
  const cellclues = editorHistory.getClue('cellclues');
  const editorColors = editorHistory.getClue('editorcolors');
  const cages = editorHistory.getClue('cages');
  const givens = editorHistory.getClue('givens');
  const paths = editorHistory.getClue('paths');
  const cells = editorHistory.getClue('cells');
  const regions = editorHistory.getClue('regions');
  const values = gameHistory.getClue('values');
  const gamecolors = gameHistory.getClue('colors');
  const cornermarks = gameHistory.getClue('cornermarks');
  const centermarks = gameHistory.getClue('centermarks');
  const notes = gameHistory.getClue('notes');

  const offsets: Margins = {
    left: (margins?.left ?? 0) - (dimensions.margins?.left ?? 0),
    right: (margins?.right ?? 0) - (dimensions.margins?.right ?? 0),
    top: (margins?.top ?? 0) - (dimensions.margins?.top ?? 0),
    bottom: (margins?.bottom ?? 0) - (dimensions.margins?.bottom ?? 0)
  };
  if (offsets.left !== 0 || offsets.right !== 0 || offsets.top !== 0 || offsets.bottom !== 0) {
    const newDimensions = {
      rows: dimensions.rows + offsets.top + offsets.bottom,
      columns: dimensions.columns + offsets.left + offsets.right,
      margins:
        margins && (margins.left > 0 || margins.right > 0 || margins.top > 0 || margins.bottom > 0)
          ? margins
          : undefined
    };
    const isValidPosition = (p: Position, modifier = 0): boolean =>
      p.row >= 0 &&
      p.row < newDimensions.rows + modifier &&
      p.column >= 0 &&
      p.column < newDimensions.columns + modifier;

    editorHistory.set({
      dimensions: newDimensions,
      borderclues: borderclues
        .map((clue) => {
          return {
            ...clue,
            positions: offsetPositions(clue.positions, offsets) as [Position, Position]
          };
        })
        .filter((clue) => clue.positions.every(isValidPosition)),
      cellclues: cellclues
        .map((clue) => {
          return {
            ...clue,
            position: {
              row: clue.position.row + offsets.top,
              column: clue.position.column + offsets.left
            }
          };
        })
        .filter((clue) => isValidPosition(clue.position)),
      editorcolors: offsetMatrix(editorColors, offsets, null),
      cages: cages
        .map((cage) => {
          return { ...cage, positions: offsetPositions(cage.positions, offsets) };
        })
        .filter((clue) => clue.positions.every(isValidPosition)),
      givens: offsetMatrix(givens, offsets, ''),
      paths: paths
        .map((path) => {
          return { ...path, positions: offsetPositions(path.positions, offsets) };
        })
        .filter((clue) => clue.positions.every(isValidPosition)),
      cells: offsetMatrix(cells, offsets, false),
      regions: regions
        .map((region) => {
          return { ...region, positions: offsetPositions(region.positions, offsets) };
        })
        .filter((region) => region.positions.every(isValidPosition))
    });
    gameHistory.set({
      values: offsetMatrix(values, offsets, ''),
      colors: offsetMatrix(gamecolors, offsets, []),
      cornermarks: offsetMatrix(cornermarks, offsets, ''),
      centermarks: offsetMatrix(centermarks, offsets, ''),
      notes: offsetMatrix(notes, offsets, '')
    });

    selectedCells.set(offsetPositions(get(selectedCells), offsets).filter(isValidPosition));
    highlightedCells.set(offsetPositions(get(highlightedCells), offsets).filter(isValidPosition));
    wrongCells.set(offsetPositions(get(wrongCells), offsets).filter(isValidPosition));
  }
}

function offsetPositions(positions: Position[], offsets: Margins): Position[] {
  return positions.map((position) => {
    return { row: position.row + offsets.top, column: position.column + offsets.left };
  });
}

function offsetMatrix<T>(clues: T[][], offsets: Margins, frameValue: T): T[][] {
  const newClues = deepCopy(
    Array(clues.length + offsets.top + offsets.bottom).fill(
      Array(clues[0].length + offsets.left + offsets.right).fill(frameValue)
    )
  );
  for (let i = 0; i < clues.length; ++i) {
    if (i + offsets.top < 0) continue;
    if (i + offsets.top >= newClues.length) break;
    for (let j = 0; j < clues[0].length; ++j) {
      if (j + offsets.left < 0) continue;
      if (j + offsets.left >= newClues[i + offsets.top].length) break;
      newClues[i + offsets.top][j + offsets.left] = clues[i][j];
    }
  }
  return newClues;
}
