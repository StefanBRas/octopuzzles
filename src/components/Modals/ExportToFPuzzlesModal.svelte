<script lang="ts">
  import CtCLink from '$components/shareButtons/CtCLink.svelte';
  import FPuzzlesLink from '$components/shareButtons/FPuzzlesLink.svelte';
  import CtC from '$icons/CtC.svelte';
  import FPuzzles from '$icons/FPuzzles.svelte';
  import type { EditorHistoryStep } from '$types';
  import { compressToBase64 } from '$utils/compressor';
  import { getSudokuGameContext } from '$utils/context/sudoku';
  import { exportAsFPuzzlesJson } from '$utils/exportAsFPuzzlesJson';

  export let isOpen: boolean;
  export let sudoku: EditorHistoryStep;
  export let title: string;
  export let description: string;

  const gameHistory = getSudokuGameContext();

  let puzzleData = compressToBase64(
    exportAsFPuzzlesJson(sudoku, gameHistory.getValues(), title, description)
  );
</script>

{#if isOpen}
  <div role="dialog" class="bg-white shadow rounded-md p-4 flex flex-col">
    <FPuzzlesLink class="w-6 h-6 block" {puzzleData}><FPuzzles /></FPuzzlesLink>
    <CtCLink class="w-6 h-6 block" {puzzleData}><CtC /></CtCLink>
  </div>
{/if}
