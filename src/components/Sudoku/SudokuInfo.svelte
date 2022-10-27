<script lang="ts">
  import classNames from 'classnames';
  import CaretUp from 'phosphor-svelte/lib/CaretUp/CaretUp.svelte';
  import CaretDown from 'phosphor-svelte/lib/CaretDown/CaretDown.svelte';
  import FacebookLogo from 'phosphor-svelte/lib/FacebookLogo/FacebookLogo.svelte';
  import RedditLogo from 'phosphor-svelte/lib/RedditLogo/RedditLogo.svelte';
  import TwitterLogo from 'phosphor-svelte/lib/TwitterLogo/TwitterLogo.svelte';
  import WhatsappLogo from 'phosphor-svelte/lib/WhatsappLogo/WhatsappLogo.svelte';
  import Image from 'phosphor-svelte/lib/Image/Image.svelte';
  import { formatDistanceToNowStrict } from 'date-fns';
  import PuzzleLabel from '$ui/PuzzleLabel.svelte';
  import TwitterLink from '$components/shareButtons/TwitterLink.svelte';
  import FacebookLink from '$components/shareButtons/FacebookLink.svelte';
  import WhatsAppLink from '$components/shareButtons/WhatsAppLink.svelte';
  import RedditLink from '$components/shareButtons/RedditLink.svelte';
  import type { Sudoku } from '$models/Sudoku';
  import type { WithId } from 'mongodb';
  import type { User } from '$models/User';
  import type { Vote } from '$models/Vote';
  import type { Label } from '$models/Label';
  import trpc from '$lib/client/trpc';

  export let sudoku: WithId<Sudoku> & {
    creator?: WithId<User> | null;
    userVote?: WithId<Vote> | null;
    fullLabels: WithId<Label>[];
  };
  export let takeScreenshot: () => void;

  async function vote(value: number) {
    return await trpc().mutation('votes:vote', { sudoku_id: sudoku._id, value });
  }

  $: pointsWithoutUserVote = (sudoku.points ?? 0) - (sudoku.userVote?.value ?? 0);

  let userVote = sudoku.userVote == null || sudoku.userVote.value === 0 ? 0 : sudoku.userVote.value;

  async function handleVote(value: 1 | -1): Promise<void> {
    if (sudoku.public_since) {
      let newValue = userVote === value ? 0 : value;
      userVote = newValue; // optimistic
      const res = await vote(newValue);

      if (res) {
        userVote = res.value;
      }
    }
  }
</script>

<aside class="p-8">
  <div class="mb-4 flex items-center justify-between">
    <div class="flex items-center">
      <div class="flex flex-col text-sm text-gray-500 items-center">
        <button
          class={classNames(
            'w-8 h-8 transition-colors',
            { 'hover:text-orange-500 cursor-pointer': sudoku.public_since != null },
            userVote > 0 && 'text-orange-500'
          )}
          on:click={() => handleVote(1)}
          disabled={sudoku.public_since == null}
        >
          <CaretUp size={32} />
        </button>
        <p
          class={classNames('font-bold text-lg -my-2', {
            'text-orange-500': userVote !== 0
          })}
        >
          {pointsWithoutUserVote + userVote}
        </p>
        <button
          class={classNames(
            'w-8 h-8 transition-colors',
            { 'hover:text-orange-500 cursor-pointer': sudoku.public_since != null },
            userVote < 0 && 'text-orange-500'
          )}
          on:click={() => handleVote(-1)}
          disabled={sudoku.public_since == null}
        >
          <CaretDown size={32} />
        </button>
      </div>

      <div class="ml-4">
        <h1 class="text-3xl">{sudoku.title}</h1>
        <div class="text-gray-600 text-sm flex">
          <p>
            {#if sudoku.public_since}
              Created {formatDistanceToNowStrict(sudoku.public_since)} ago
            {/if}
            by
            {#if sudoku.creator}
              <a
                class="font-semibold hover:underline hover:text-blue-500"
                href="/user/{sudoku.creator._id}">{sudoku.creator.username}</a
              >
            {:else}
              [DELETED]
            {/if}
            {#if sudoku.public_since == null}
              -
              <span class="text-orange-500">NOT PUBLIC</span>
            {/if}
          </p>
        </div>
      </div>
    </div>

    <div class="flex space-x-2">
      <p>Share:</p>
      <TwitterLink
        class="w-6 h-6 block"
        url="https://www.octopuzzles.com/sudoku/{sudoku._id}"
        text="Can you solve this?"><TwitterLogo size={24} /></TwitterLink
      >

      <FacebookLink class="w-6 h-6 block" url="https://www.octopuzzles.com/sudoku/{sudoku._id}"
        ><FacebookLogo size={24} /></FacebookLink
      >

      <WhatsAppLink
        class="w-6 h-6 block"
        text="Can you solve this? https://www.octopuzzles.com/sudoku/{sudoku._id}"
        ><WhatsappLogo size={24} /></WhatsAppLink
      >

      <RedditLink
        class="w-6 h-6 block"
        text="Can you solve this?"
        url="https://www.octopuzzles.com/sudoku/{sudoku._id}"><RedditLogo size={24} /></RedditLink
      >

      <button class="w-6 h-6 block" title="Take image of sudoku" on:click={takeScreenshot}
        ><Image size={24} /></button
      >
    </div>
  </div>

  <hr />

  {#if sudoku.fullLabels}
    <div class="flex gap-2 mb-4">
      {#each sudoku.fullLabels as label}
        <a href="/?label={label._id}">
          <PuzzleLabel {label} class="hover:bg-gray-200 transition-colors" />
        </a>
      {/each}
    </div>
  {/if}

  <p class="whitespace-pre-line max-w-7xl">{sudoku.description}</p>

  {#if sudoku.solution == null}
    <p class="text-gray-800 text-sm mt-4">Info: No solution provided for this puzzle</p>
  {/if}
</aside>
