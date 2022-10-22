<script lang="ts">
  import { onMount } from 'svelte';
  import {
    highlightedCells,
    highlightedItemIndex,
    selectedCells,
    selectedItemIndex
  } from '$stores/sudokuStore';
  import SudokuList from '$components/Sudoku/SudokuList.svelte';
  import PuzzleLabel from '$ui/PuzzleLabel.svelte';
  import Filters from '$icons/Filters.svelte';
  import { page } from '$app/stores';
  import classNames from 'classnames';
  import Button from '$ui/Button.svelte';
  import type { PageData } from './$types';
  import trpc from '$lib/client/trpc';
  import type { ObjectId } from 'mongodb';

  export let data: PageData;

  let currentCursor: Date | undefined = undefined;
  let nextCursor: Date | undefined = undefined;
  $: nextCursor = data.sudokuData.nextCursor;

  let loading = false;

  async function loadNextPage() {
    loading = true;
    currentCursor = nextCursor;
    let sudokuData = await trpc().query('sudokus:search', {
      labels: [],
      limit: 24,
      cursor: nextCursor
    });
    data.sudokuData = sudokuData;
    nextCursor = sudokuData.nextCursor;
    loading = false;
  }

  async function refetch(labels: ObjectId[]) {
    loading = true;
    await trpc().query('sudokus:search', { labels, limit: 24, cursor: currentCursor });
    loading = false;
  }

  onMount(() => {
    $highlightedItemIndex = -1;
    $selectedItemIndex = -1;
    $selectedCells = [];
    $highlightedCells = [];
  });

  let showFilters = false;

  let activeLabels = $page.url.searchParams.getAll('label');

  function search(): void {
    $page.url.searchParams.delete('label');
    activeLabels.forEach((l) => {
      $page.url.searchParams.append('label', l);
    });

    window.history.pushState('page2', 'Title', '?' + $page.url.searchParams.toString());

    refetch(activeLabels as unknown as ObjectId[]);
  }

  function toggleLabel(labelId: string): void {
    let found = false;
    activeLabels = activeLabels.filter((l) => {
      if (labelId === l) {
        found = true;
        return false;
      }

      return true;
    });
    if (!found) {
      activeLabels = [...activeLabels, labelId];
    }
  }
</script>

<svelte:head>
  <title>OctoPuzzles</title>
  <meta
    name="description"
    content="Play and create your own Sudoku based puzzles at OctoPuzzles."
  />
  <meta property="og:image" content="https://octopuzzles.com/favicon.png" />
  <meta
    property="og:description"
    content="Play and create your own Sudoku based puzzles at OctoPuzzles."
  />
  <meta property="og:title" content="OctoPuzzles" />
</svelte:head>

<button
  title="Filter results"
  class="flex gap-1 items-center ml-auto mr-4 rounded-full hover:bg-gray-100 px-2 py-1"
  on:click={() => (showFilters = !showFilters)}
>
  <span class="text-sm text-gray-500">Filter</span>
  <span class="w-6 h-6"><Filters /></span>
</button>

{#if showFilters}
  <div class="w-full shadow-inner bg-gray-100 py-4 px-4 mt-4">
    <h2 class="font-semibold mb-2">Labels</h2>
    <div class="flex gap-2 flex-wrap">
      {#each data.labels as label}
        {@const selected = activeLabels.includes(label._id.toString())}
        <button on:click={() => toggleLabel(label._id.toString())}>
          <PuzzleLabel
            {label}
            class={classNames(
              'hover:ring-1 hover:ring-orange-500 active:bg-orange-200 transition-colors',
              {
                'bg-orange-200': selected,
                'bg-gray-300': !selected
              }
            )}
          />
        </button>
      {/each}
    </div>

    <div>
      <Button variant="primary" class="mt-4 ml-auto flex" on:click={search}>Search</Button>
      <Button
        variant="subtle"
        on:click={() => {
          if (activeLabels.length > 0) {
            activeLabels = [];
            search();
          }
        }}>Clear filters</Button
      >
    </div>
  </div>
{/if}

{#if data.sudokuData != null}
  <SudokuList
    hasNextPage={data.sudokuData.nextCursor != null}
    {loadNextPage}
    {loading}
    sudokus={data.sudokuData.sudokus ?? null}
  />
{/if}
