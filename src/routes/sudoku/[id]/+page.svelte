<script lang="ts">
  import html2canvas from 'html2canvas';
  import SudokuInfo from '$components/Sudoku/SudokuInfo.svelte';
  import { createGameHistoryStore, createSudokuInteractionModeStore } from '$stores/sudokuStore';
  import { onMount, setContext } from 'svelte';
  import { openModal } from '$stores/modalStore';
  import FinishedSudokuModal from '$components/Modals/FinishedSudokuModal.svelte';
  import { getUserSolution } from '$utils/getSolution';
  import type { PageData } from './$types';
  import { walkthroughStore } from '$stores/walkthroughStore';
  import { fillWalkthroughStore } from '$utils/fillWalkthroughStore';
  import SudokuGame from '$components/Sudoku/sudokuGame/SudokuGame.svelte';
  import {
    defaultBorderclues,
    defaultCages,
    defaultCellclues,
    defaultCells,
    defaultEditorColors,
    defaultGivens,
    defaultLogic,
    defaultPaths,
    defaultRegions
  } from '$utils/defaults';
  import type { EditorHistoryStep } from '$types';
  import {
    SUDOKU_GAME_CONTEXT_KEY,
    SUDOKU_INTERACTION_MODE_CONTEXT_KEY
  } from '$utils/context/sudoku';

  export let data: PageData;

  const sudoku: EditorHistoryStep = {
    ...data.sudoku,
    borderclues: data.sudoku.borderclues ?? defaultBorderclues(),
    cellclues: data.sudoku.cellclues ?? defaultCellclues(),
    cells: data.sudoku.cells ?? defaultCells(data.sudoku.dimensions),
    colors: data.sudoku.colors ?? defaultEditorColors(data.sudoku.dimensions),
    dimensions: data.sudoku.dimensions,
    extendedcages: data.sudoku.extendedcages ?? defaultCages(),
    givens: data.sudoku.givens ?? defaultGivens(data.sudoku.dimensions),
    logic: data.sudoku.logic ?? defaultLogic(),
    paths: data.sudoku.paths ?? defaultPaths(),
    regions: data.sudoku.regions ?? defaultRegions(data.sudoku.dimensions)
  };

  const gameHistory = createGameHistoryStore(sudoku.dimensions);
  const interactionMode = createSudokuInteractionModeStore();
  setContext(SUDOKU_GAME_CONTEXT_KEY, gameHistory);
  setContext(SUDOKU_INTERACTION_MODE_CONTEXT_KEY, interactionMode);

  const wrongCells = interactionMode.wrongCells;

  $: if (data.walkthrough?.steps) {
    // Just so ts will shut up
    fillWalkthroughStore(data.walkthrough);
  } else {
    walkthroughStore.set([]);
  }

  // TIMER: one that does not run when the tab is inactive, but runs as if it had.
  let now = Date.now();
  const start = Date.now();
  let timer: ReturnType<typeof setInterval>;

  $: t = Math.floor((now - start) / 1000);

  $: seconds = `0${t % 60}`.slice(-2);
  $: minutes = `0${Math.floor(t / 60) % 60}`.slice(-2);
  $: hours = t >= 3600 ? `0${Math.floor(t / 3600) % 24}`.slice(-2) + ':' : '';
  $: days = t >= 86400 ? Math.floor(t / 86400) + 'd ' : '';

  // When the page is not visible, the timer should not run, but it should also not stop, but be incremented by the number of seconds the user was off screen
  function handleVisibilityChange(): void {
    if (document.hidden) {
      clearInterval(timer);
    } else {
      timer = setInterval(() => {
        now = Date.now();
      }, 1000);
    }
  }
  onMount(() => {
    timer = setInterval(() => {
      now = Date.now();
    }, 1000);
    document.addEventListener('visibilitychange', handleVisibilityChange);
  });

  let values = gameHistory.subscribeToValue('values');
  let gameColors = gameHistory.subscribeToValue('colors');
  let cornermarks = gameHistory.subscribeToValue('cornermarks');
  let centermarks = gameHistory.subscribeToValue('centermarks');
  let notes = gameHistory.subscribeToValue('notes');

  function checkSolution(numbers: string[][]): boolean {
    $wrongCells = [];
    let solution = data.sudoku?.solution;
    if (solution?.numbers == null) return false;

    if (
      solution.numbers.length !== numbers.length ||
      solution.numbers[0].length !== numbers[0].length
    ) {
      return false;
    }

    let userSolution = getUserSolution({
      givens: data.sudoku.givens ?? defaultGivens(data.sudoku.dimensions),
      values: numbers
    });

    let isDone = true;

    userSolution.forEach((row, rowIndex) => {
      row.forEach((cell, columnIndex) => {
        if (solution && solution.numbers[rowIndex][columnIndex] !== cell) {
          if (cell.length > 0) {
            $wrongCells = [...$wrongCells, { row: rowIndex, column: columnIndex }];
          }
          isDone = false;
        }
      });
    });
    return isDone;
  }

  function showDoneModal(): void {
    if (data.sudoku?.id) {
      openModal(FinishedSudokuModal, {
        sudokuId: data.sudoku.id,
        takeScreenshot,
        finishTime: `${days}${hours}${minutes}:${seconds}`
      });
    }
  }

  $: if (checkSolution($values)) {
    clearInterval(timer);
    showDoneModal();
  }

  function takeScreenshot(): void {
    const sudokuDisplay = document.querySelector<HTMLElement>('#sudoku-display');
    if (sudokuDisplay == null) return;

    html2canvas(sudokuDisplay).then((canvas) => {
      const base64image = canvas.toDataURL('image/png');
      window.open(base64image);
    });
  }
</script>

<svelte:head>
  <title>{data.sudoku.title} | OctoPuzzles</title>
  <meta name="description" content={data.sudoku?.description} />

  <meta property="og:title" content="{data.sudoku?.title ?? 'Sudoku'} | OctoPuzzles" />
  <meta property="og:description" content={data.sudoku?.description} />
  <meta property="og:url" content="http://www.octopuzzles.com/sudoku/{data.sudoku.id}" />
  <meta property="og:type" content="website" />
</svelte:head>

<!-- Header -->
<div class="flex items-center justify-center h-20 absolute top-0 w-full pointer-events-none">
  <div class="flex w-full justify-end sm:justify-center">
    <div class="flex flex-col items-center">
      <h1 class="text-xl font-medium text-center w-96 md:w-auto truncate">
        {data.sudoku.title}
      </h1>
      <span>
        {days}
        {hours}{minutes}:{seconds}
      </span>
    </div>
  </div>
</div>

<SudokuGame
  {sudoku}
  values={$values}
  gameColors={$gameColors}
  cornermarks={$cornermarks}
  centermarks={$centermarks}
  notes={$notes}
/>

<SudokuInfo sudoku={data.sudoku} {takeScreenshot} />
