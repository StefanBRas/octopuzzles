<script lang="ts">
  import { walkthroughStore } from '$stores/walkthroughStore';
  import { editorHistory, gameHistory } from '$stores/sudokuStore';
  import SudokuDisplay from '$components/Sudoku/Display/index.svelte';
  import Button from '$ui/Button.svelte';
  import ArrowsCounterClockwise from 'phosphor-svelte/lib/ArrowsCounterClockwise/ArrowsCounterClockwise.svelte';
  import Trash from 'phosphor-svelte/lib/Trash/Trash.svelte';
  import Swap from 'phosphor-svelte/lib/Swap/Swap.svelte';
  import ArrowsOutLineVertical from 'phosphor-svelte/lib/ArrowsOutLineVertical/ArrowsOutLineVertical.svelte';

  export let editable = false;
  export let isOpen: boolean;

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

  function updateStepDescription(
    step: number,
    e: Event & {
      currentTarget: EventTarget & HTMLTextAreaElement;
    }
  ): void {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    walkthroughStore.changeDescriptionOfStep(step, (e.target as any)?.value);
  }
</script>

{#if isOpen}
  <div role="dialog" class="bg-white shadow rounded-md p-4 flex flex-col">
    <h2 class="text-center font-bold text-2xl">Walkthrough</h2>
    {#if editable}
      <p>Info: We automatically save your walkthrough whenever you save your sudoku puzzle</p>
    {/if}

    {#each $walkthroughStore as { step, description }, i}
      <div>
        <div class="flex space-x-4 items-center mb-2 mt-2">
          <h4 class="font-medium">Step {i + 1}</h4>
          <button
            class="w-6 h-6 rounded-full p-1 hover:bg-gray-100 hover:text-gray-600"
            on:click={() => {
              gameHistory.set(step);
            }}
            title="Reset to this step"><ArrowsCounterClockwise size={16} /></button
          >
          {#if editable}
            <button
              on:click={() => walkthroughStore.addStep(i)}
              title="Insert a new step"
              class="w-6 h-6 rounded-full p-1 hover:bg-red-100 hover:text-red-600"
              ><ArrowsOutLineVertical size={16} /></button
            >
            <button
              on:click={() => walkthroughStore.addStep(i, true)}
              title="Replace this step"
              class="w-6 h-6 rounded-full p-1 hover:bg-red-100 hover:text-red-600"
              ><Swap size={16} /></button
            >
            <button
              on:click={() => walkthroughStore.removeStep(i)}
              title="Delete this step"
              class="w-6 h-6 rounded-full p-1 hover:bg-red-100 hover:text-red-600"
              ><Trash size={16} /></button
            >
          {/if}
        </div>
      </div>
      <div class="flex space-x-2 items-start">
        <div class="w-1/2">
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
        <div class="w-1/2 h-full">
          {#if editable}
            <textarea
              on:change={(e) => updateStepDescription(i, e)}
              class="border border-gray-300 py-2 px-4 leading-5 rounded-md w-full focus:ring focus:ring-blue-300 focus:border-blue-500 disabled:bg-gray-200 h-full"
              placeholder="Add a description"
              value={description}
              data-ignoreshortcuts
            />
          {:else}
            <div>
              {description}
            </div>
          {/if}
        </div>
      </div>
    {/each}

    {#if editable}
      <div class="w-full flex justify-center mt-2">
        <Button variant="primary" on:click={() => walkthroughStore.addStep()}>
          Add step to walkthrough
        </Button>
      </div>
    {/if}
  </div>
{/if}
