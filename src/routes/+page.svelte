<script lang="ts">
  import type { PageData } from './$types';

  export let data: PageData;
</script>

<svelte:head>
  <title>A tRPC-SvelteKit Example Appplication • Bookstall</title>
</svelte:head>

Hi
{#if data.labels && data.labels.length > 0}
  {#each data.labels as label}
    {label.name}
    {label.description}
  {/each}
{/if}
