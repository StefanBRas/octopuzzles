<script lang="ts">
  import { walkthroughStore } from '$stores/walkthroughStore';
  import { editorHistory, gameHistory } from '$stores/sudokuStore';
  import SudokuDisplay from '$components/Sudoku/Display/index.svelte';
  import ArrowsCounterClockwise from 'phosphor-svelte/lib/ArrowsCounterClockwise/ArrowsCounterClockwise.svelte';
  import AppWindow from 'phosphor-svelte/lib/AppWindow/AppWindow.svelte';
  import { page } from '$app/stores';
  import classNames from 'classnames';
  import HtmlContent from '$components/Sudoku/HTMLContent.svelte';

  const inModal = !$page.url.pathname.endsWith('/walkthrough');

  let givens = editorHistory.getClue('givens');
  let borderclues = editorHistory.getClue('borderclues');
  let cellclues = editorHistory.getClue('cellclues');
  let regions = editorHistory.getClue('regions');
  let cells = editorHistory.getClue('cells');
  let editorColors = editorHistory.getClue('editorcolors');
  let cages = editorHistory.getClue('cages');
  let paths = editorHistory.getClue('paths');
  let dimensions = editorHistory.getClue('dimensions');
  let logic = editorHistory.getClue('logic');
</script>

<div class="h-full flex-1 overflow-y-hidden flex flex-col">
  <div
    class={classNames(
      'w-full flex-1 p-2 relative',
      inModal && 'bg-gray-100 border-b border-gray-200'
    )}
  >
    {#if inModal}
      <a
        class="absolute right-1 top-1"
        href={`${$page.url.pathname}/walkthrough`}
        title="Open in another tab"><AppWindow /></a
      >
    {/if}
    <h2 class="text-center font-bold text-2xl">Walkthrough</h2>
  </div>

  <div class="shrink overflow-y-auto p-4">
    {#each $walkthroughStore as { step, description }, i}
      <div>
        <div class="flex space-x-4 items-center mb-2 mt-2">
          <h4 class="font-medium">Step {i + 1}</h4>
          {#if inModal}
            <button
              class="w-6 h-6 rounded-full p-1 hover:bg-gray-100 hover:text-gray-600"
              on:click={() => {
                gameHistory.set(step);
              }}
              title="Reset to this step"><ArrowsCounterClockwise size={16} /></button
            >
          {/if}
        </div>
      </div>
      <div class="grid gap-2 grid-cols-2">
        <div>
          <SudokuDisplay
            borderClues={$borderclues}
            cages={$cages}
            cellClues={$cellclues}
            cells={$cells}
            dimensions={$dimensions}
            editorColors={$editorColors}
            givens={$givens}
            logic={$logic}
            paths={$paths}
            regions={$regions}
            cornermarks={step.cornermarks}
            centermarks={step.centermarks}
            values={step.values}
            gameColors={step.colors}
            notes={step.notes}
          />
        </div>
        <div>
          <HtmlContent content={description} />
        </div>
      </div>
    {/each}
  </div>
</div>
