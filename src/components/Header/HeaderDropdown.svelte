<script lang="ts">
  import { mutation, graphql, query } from '$houdini';
  import type { Logout, Me } from '$houdini';
  import { navigating } from '$app/stores';
  import { goto } from '$app/navigation';
  import { UserCircle } from 'phosphor-svelte';
  import { authMode } from '$stores/authStore';
  import Button from '$ui/Button.svelte';
  import AuthDrawer from '$components/Drawer/AuthDrawer/index.svelte';
  import { me } from '$stores/meStore';

  const {
    data: meData,
    refetch,
    error
  } = query<Me>(graphql`
    query Me {
      me {
        id
        username
      }
    }
  `);

  $: if ($error != null) {
    $me = null;
  } else {
    $me = $meData?.me ?? null;
  }

  const logout = mutation<Logout>(graphql`
    mutation Logout {
      logout
    }
  `);

  const handleLogout = async (): Promise<void> => {
    await logout(null);
    await refetch();
    await goto('/');
  };

  let details: HTMLDetailsElement;

  $: if ($navigating && details) details.open = false;
</script>

{#if $me}
  <details bind:this={details}>
    <summary
      class="cursor-pointer flex justify-center items-center mr-2"
      aria-label="View profile and more"
      aria-haspopup="menu"
    >
      <UserCircle size={35} />
    </summary>
    <div
      class="absolute right-2 left-auto list-none shadow-lg bg-white ring-1 ring-black ring-opacity-10 focus:outline-none w-56 rounded-md mt-0.5 overflow-hidden z-50"
      role="menu"
    >
      <p class="p-2">
        Hello <strong>{$me.username}</strong>
      </p>

      <hr />

      <ul class="py-1">
        <li class="w-full">
          <a
            sveltekit:prefetch
            href="/sudoku/editor"
            class="block py-1 px-2 hover:bg-gray-200 w-full">Create sudoku</a
          >
        </li>
        <li class="w-full">
          <a
            sveltekit:prefetch
            href="/user/{$me.id}"
            class="block py-1 px-2 hover:bg-gray-200 w-full">Profile</a
          >
        </li>
        <li class="w-full">
          <a sveltekit:prefetch href="/settings" class="block py-1 px-2 hover:bg-gray-200 w-full"
            >Settings</a
          >
        </li>
      </ul>

      <hr />

      <div class="py-1">
        <button class="px-2 py-1 w-full text-left hover:bg-gray-200" on:click={handleLogout}>
          Log Out
        </button>
      </div>
    </div>
  </details>
{:else}
  <div class="flex space-x-2 pr-4">
    <Button on:click={() => authMode.setAuthMode('login')}>Log In</Button>
    <Button on:click={() => authMode.setAuthMode('signup')} variant="primary">Sign Up</Button>
  </div>
{/if}
<AuthDrawer />

<style>
  /* Allow the dropdown to close when pressing outside the dropdown */
  details[open] > summary::before {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 40;
    display: block;
    cursor: default;
    content: ' ';
    background: transparent;
  }
</style>
