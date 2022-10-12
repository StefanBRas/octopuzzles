<script lang="ts">
  import { page } from '$app/stores';
  import Logo from '$icons/Logo.svelte';
  import classNames from 'classnames';
  import HeaderDropdown from './HeaderDropdown.svelte';

  $: isSudokuPage = $page.url.pathname.startsWith('/sudoku');
</script>

<header class="flex items-center justify-between h-20">
  <a href="/" class={classNames('m-2', { 'hidden sm:block': isSudokuPage })}>
    <Logo size={140} />
  </a>
  <div class={isSudokuPage ? 'hidden sm:block' : ''}>
    <HeaderDropdown />
  </div>
</header>
