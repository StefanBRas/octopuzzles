<script lang="ts">
  import { openModal } from '$stores/modalStore';
  import DangerActionModal from '$components/Modals/DangerActionModal.svelte';
  import { onMount } from 'svelte';
  import {
    highlightedCells,
    highlightedItemIndex,
    selectedCells,
    selectedItemIndex
  } from '$stores/sudokuStore';
  import SudokuList from '$components/Sudoku/SudokuList.svelte';
  import type { ObjectId } from 'mongodb';
  import trpc from '$lib/client/trpc';
  import type { PageData } from './$types';

  export let data: PageData;

  let nextCursor: Date | null | undefined = undefined;
  $: nextCursor = data.sudokus.nextCursor;

  let loading = false;

  async function loadNextPage() {
    loading = true;
    let sudokuData = await trpc().query('sudokus:search', {
      labels: [],
      limit: 24,
      cursor: nextCursor
    });
    data.sudokus = sudokuData;
    nextCursor = sudokuData.nextCursor;
    loading = false;
  }

  function deleteSudoku(id: ObjectId): void {
    openModal(DangerActionModal, {
      onAccept: async () => {
        await trpc().mutation('sudokus:delete', { id: id.toString() });
      }
    });
  }

  onMount(() => {
    $highlightedItemIndex = -1;
    $selectedItemIndex = -1;
    $selectedCells = [];
    $highlightedCells = [];
  });
</script>

<svelte:head>
  <title>{data.user.username} | OctoPuzzles</title>
  <meta name="description" content="Sudokus made by {data.user.username}" />
  <meta property="og:image" content="https://octopuzzles.com/favicon.png" />
  <meta property="og:description" content="Sudokus made by {data.user.username}" />
  <meta property="og:title" content="{data.user.username} | OctoPuzzles" />
</svelte:head>

{#if data}
  <h1 class="text-center text-4xl font-bold mb-4">
    Sudokus by {data.user.username == data.me?.username ? 'you' : data.user.username}
  </h1>
{/if}
<SudokuList
  hasNextPage={data.sudokus.nextCursor != null}
  {loadNextPage}
  {loading}
  sudokus={data.sudokus.sudokus ?? null}
  deleteSudoku={data.me != null ? deleteSudoku : undefined}
/>
