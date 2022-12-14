<script lang="ts">
  import { cellSize } from '$constants';
  import type { GameHistoryStep, EditorHistoryStep } from '$types';
  import BorderClues from './Clues/BorderClues.svelte';
  import CellClues from './Clues/CellClues.svelte';
  import Cells from './Clues/Cells.svelte';
  import Colors from './Clues/Colors.svelte';
  import CornerMarks from './Clues/CornerMarks.svelte';
  import CenterMarks from './Clues/CenterMarks.svelte';
  import KillerCages from './Clues/KillerCages.svelte';
  import Numbers from './Clues/Numbers.svelte';
  import Paths from './Clues/Paths.svelte';
  import Notes from './Clues/Notes.svelte';
  import Logic from './Clues/Logic.svelte';
  import Regions from './Clues/Regions.svelte';

  // EDITOR STATE
  export let sudoku: EditorHistoryStep;
  export let interactive = false;

  // GAME STATE
  export let values: GameHistoryStep['values'] | null = null;
  export let gameColors: GameHistoryStep['colors'] | null = null;
  export let cornermarks: GameHistoryStep['cornermarks'] | null = null;
  export let centermarks: GameHistoryStep['centermarks'] | null = null;
  export let notes: GameHistoryStep['notes'] | null = null;
</script>

<svg
  viewBox="-2 -2 {sudoku.dimensions.columns * cellSize + 4} {sudoku.dimensions.rows * cellSize + 4}"
  class="max-h-full max-w-full"
>
  <Colors editorColors={sudoku.colors} {gameColors} dimensions={sudoku.dimensions} />
  <slot name="highlights" />
  <slot name="interface" />
  <Paths paths={sudoku.paths} />
  <KillerCages cages={sudoku.extendedcages} dimensions={sudoku.dimensions} />
  <Cells cells={sudoku.cells} />
  <Notes {notes} />
  <Regions regions={sudoku.regions} dimensions={sudoku.dimensions} />
  <BorderClues borderClues={sudoku.borderclues} {interactive} />
  <CellClues cellClues={sudoku.cellclues} {interactive} />
  <CornerMarks {values} givens={sudoku.givens} dimensions={sudoku.dimensions} {cornermarks} />
  <CenterMarks {values} givens={sudoku.givens} dimensions={sudoku.dimensions} {centermarks} />
  <Numbers {values} givens={sudoku.givens} dimensions={sudoku.dimensions} />
  <Logic logic={sudoku.logic} dimensions={sudoku.dimensions} />
</svg>
