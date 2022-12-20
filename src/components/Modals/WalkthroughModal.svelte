<script lang="ts">
  import WalkthroughEditor from '$features/walkthroughs/WalkthroughEditor.svelte';
  import WalkthroughViewer from '$features/walkthroughs/WalkthroughViewer.svelte';

  export let editable = false;
  export let isOpen: boolean;
</script>

{#if isOpen}
  <div
    role="dialog"
    class="bg-white shadow max-h-[90vh] rounded-md flex flex-col overflow-y-hidden"
  >
    {#if editable}
      <WalkthroughEditor />
    {:else}
      <WalkthroughViewer />
    {/if}
  </div>
{/if}
