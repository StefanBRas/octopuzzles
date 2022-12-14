<script lang="ts">
  import { cellSize } from '$constants';
  import Controller from './Controller/index.svelte';
  import { highlightedCells, selectedCells, wrongCells, mode } from '$stores/sudokuStore';
  import type { EditorHistoryStep, GameHistoryStep } from '$types';
  import SudokuDisplay from '../Display/SudokuDisplay.svelte';
  import Interface from '../Display/Clues/Interface.svelte';
  import { setContext } from 'svelte';
  import { SUDOKU_BEING_PLAYED_CONTEXT_KEY } from '$utils/context/sudoku';

  export let sudoku: EditorHistoryStep;

  setContext(SUDOKU_BEING_PLAYED_CONTEXT_KEY, sudoku);

  // SIZING
  let windowHeight: number;
  let windowWidth: number;
  /**
   * The sudoku should be contained within the screen
   * However the screen might get so small, that we make it at least 300px big
   */
  $: sudokuSize = Math.max(Math.min(windowHeight - 88, windowWidth), 300);

  export let values: GameHistoryStep['values'];
  export let gameColors: GameHistoryStep['colors'];
  export let cornermarks: GameHistoryStep['cornermarks'];
  export let centermarks: GameHistoryStep['centermarks'];
  export let notes: GameHistoryStep['notes'];
</script>

<svelte:window bind:innerHeight={windowHeight} bind:innerWidth={windowWidth} />

<div class="flex flex-wrap w-full justify-around">
  <div class="p-2 mb-2" style="height: {sudokuSize}px; width: {sudokuSize}px" id="sudoku-display">
    <SudokuDisplay
      {sudoku}
      {notes}
      cornermarks={$mode === 'editor' ? undefined : cornermarks}
      centermarks={$mode === 'editor' ? undefined : centermarks}
      values={$mode === 'editor' ? undefined : values}
      gameColors={$mode === 'editor' ? undefined : gameColors}
    >
      <g slot="highlights">
        {#if $mode === 'game' && $wrongCells}
          {#each $wrongCells as cell}
            <rect
              class="fill-current w-cell h-cell text-red-200"
              x={cellSize * cell.column}
              y={cellSize * cell.row}
              vector-effect="non-scaling-size"
            />
          {/each}
        {/if}
        {#if $selectedCells}
          {#each $selectedCells as cell}
            <rect
              class="fill-current w-cell h-cell text-orange-300 text-opacity-40"
              x={cellSize * cell.column}
              y={cellSize * cell.row}
              vector-effect="non-scaling-size"
            />
          {/each}
        {/if}
        {#if $highlightedCells}
          {#each $highlightedCells as cell}
            <rect
              class="fill-current w-cell h-cell text-blue-100"
              x={cellSize * cell.column}
              y={cellSize * cell.row}
              vector-effect="non-scaling-size"
            />
          {/each}
        {/if}
      </g>

      <Interface cells={sudoku.cells} dimensions={sudoku.dimensions} slot="interface" />
    </SudokuDisplay>
  </div>
  <div class="my-auto">
    <Controller />
  </div>
</div>
