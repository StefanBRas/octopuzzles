<script lang="ts">
  import SudokuDisplay from './Display/index.svelte';
  import { formatDistanceToNowStrict } from 'date-fns';
  import Button from '$ui/Button.svelte';
  import { Trash, NotePencil } from 'phosphor-svelte';
  import LoadingIndicator from '$ui/LoadingIndicator.svelte';
  import {
    getAllBorderClues,
    getAllCages,
    getAllCellClues,
    isDefaultBorders
  } from '$utils/migration';
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
  import type { Sudoku } from '$models/Sudoku';
  import type { ObjectId, WithId } from 'mongodb';

  export let sudokus: WithId<Sudoku>[] | null;
  export let hasNextPage: boolean;
  export let loading: boolean;
  export let loadNextPage: () => Promise<void>;
  export let deleteSudoku: ((id: ObjectId) => void) | undefined = undefined;
</script>

{#if !sudokus && loading}
  <div class="w-full flex justify-center mt-4">
    <LoadingIndicator class="w-40 h-40 text-orange-500" />
  </div>
{/if}
{#if sudokus}
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-4">
    {#each sudokus as sudoku (sudoku._id)}
      {#if sudoku}
        <a
          class="shadow-md items-center col-span-1 flex flex-col border rounded-md m-4 overflow-hidden cursor-pointer"
          href="/sudoku/{sudoku._id}"
          sveltekit:prefetch
        >
          <div class="h-96 w-full p-4 justify-center">
            <SudokuDisplay
              cells={sudoku.cells ?? defaultCells(sudoku.dimensions)}
              regions={sudoku.regions ??
                (!isDefaultBorders(sudoku.borders, sudoku.dimensions)
                  ? []
                  : defaultRegions(sudoku.dimensions))}
              dimensions={sudoku.dimensions}
              logic={sudoku.logic ?? defaultLogic()}
              givens={sudoku.givens ?? defaultGivens(sudoku.dimensions)}
              paths={sudoku.paths ?? defaultPaths()}
              cages={getAllCages(sudoku.extendedcages, sudoku.killercages) ?? defaultCages()}
              editorColors={sudoku.colors ?? defaultEditorColors(sudoku.dimensions)}
              borderClues={getAllBorderClues(
                sudoku.borderclues,
                sudoku.borders,
                sudoku.dimensions
              ) ?? defaultBorderclues()}
              cellClues={getAllCellClues(sudoku.cellclues, sudoku.cornerclues, sudoku.symbols) ??
                defaultCellclues()}
            />
          </div>
          <div class="h-32 bg-gray-100 w-full border-t p-2">
            <div class="flex justify-between h-20">
              <div class="flex flex-col justify-around">
                <h2 class="text-gray-700 text-lg max-w-xs font-medium truncate">
                  {sudoku.title ?? '[untitled]'}
                </h2>
                <div class="flex text-sm text-gray-500">
                  <!-- {#if sudoku.creator}
                    <a
                      class="cursor-pointer hover:text-gray-800"
                      href={`/user/${sudoku.creator.id}`}
                    >
                      {sudoku.creator.username}
                    </a>
                  {:else}
                    <p class="text-sm text-gray-500">[deleted]</p>
                  {/if} -->
                  <span class="mx-1">•</span>
                  <p class="">
                    {sudoku.points ?? 0} point{Math.abs(sudoku.points) !== 1 ? 's' : ''}
                  </p>
                  <span class="mx-1">•</span>
                  {#if sudoku.public_since}
                    <p>{formatDistanceToNowStrict(sudoku.public_since)} ago</p>
                  {:else}
                    <p class="text-orange-500">Not public</p>
                  {/if}
                </div>
              </div>
              {#if deleteSudoku}
                <div class="flex flex-col items-end justify-around">
                  <a
                    class="rounded-full w-7 h-7 p-1 hover:bg-gray-200"
                    href="/sudoku/editor?id={sudoku._id}"><NotePencil size={20} /></a
                  >
                  <button
                    class="rounded-full w-7 h-7 p-1 hover:text-red-500 hover:bg-red-100"
                    on:click|preventDefault={() => deleteSudoku?.(sudoku._id)}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              {/if}
            </div>

            <!-- <div class="h-8 w-full flex items-center overflow-y-hidden overflow-x-auto">
              {#if sudoku.fullLabels}
                <div class="flex gap-2">
                  {#each sudoku.fullLabels as label}
                    <PuzzleLabel {label} />
                  {/each}
                </div>
              {/if}
            </div> -->
          </div>
        </a>
      {/if}
    {/each}
  </div>

  <div class="flex justify-center my-4">
    {#if hasNextPage}
      <Button variant="secondary" {loading} on:click={() => loadNextPage()}>Load more</Button>
    {/if}
  </div>
{/if}
