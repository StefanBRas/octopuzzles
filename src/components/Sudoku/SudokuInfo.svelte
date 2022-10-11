<script lang="ts">
  import { fragment, graphql, mutation } from '$houdini';
  import type { Vote } from '$houdini';
  import type { SudokuInfo } from '$houdini';
  import classNames from 'classnames';
  import { CaretUp, CaretDown } from 'phosphor-svelte';
  import { formatDistanceToNowStrict } from 'date-fns';
  import PuzzleLabel from '$ui/PuzzleLabel.svelte';
  import TwitterLink from '$components/shareButtons/TwitterLink.svelte';
  import FacebookLink from '$components/shareButtons/FacebookLink.svelte';
  import WhatsAppLink from '$components/shareButtons/WhatsAppLink.svelte';
  import RedditLink from '$components/shareButtons/RedditLink.svelte';
  import { TwitterLogo, FacebookLogo, WhatsappLogo, RedditLogo, Image } from 'phosphor-svelte';

  export let sudoku: SudokuInfo;
  export let takeScreenshot: () => void;

  const data = fragment(
    graphql`
      fragment SudokuInfo on Sudoku {
        id
        title
        description
        publicSince
        points
        userVote {
          id
          value
        }
        creator {
          id
          username
        }
        solution {
          numbers
        }
        fullLabels {
          id
          name
          description
        }
      }
    `,
    sudoku
  );

  const vote = mutation<Vote>(graphql`
    mutation Vote($sudokuId: ObjectId!, $value: Int!) {
      vote(sudokuId: $sudokuId, value: $value) {
        id
        value
      }
    }
  `);

  $: pointsWithoutUserVote = ($data?.points ?? 0) - ($data?.userVote?.value ?? 0);

  let userVote = $data?.userVote == null || $data.userVote.value === 0 ? 0 : $data.userVote.value;

  async function handleVote(value: 1 | -1): Promise<void> {
    if ($data && $data.publicSince) {
      let newValue = userVote === value ? 0 : value;
      userVote = newValue; // optimistic
      const res = await vote(
        { sudokuId: $data.id, value: newValue },
        {
          optimisticResponse: {
            vote: {
              id: $data.id,
              value: newValue
            }
          }
        }
      );

      if (res) {
        userVote = res.vote?.value ?? 0;
      }
    }
  }
</script>

{#if $data}
  <aside class="p-8">
    <div class="mb-4 flex items-center justify-between">
      <div class="flex items-center">
        <div class="flex flex-col text-sm text-gray-500 items-center">
          <button
            class={classNames(
              'w-8 h-8 transition-colors',
              { 'hover:text-orange-500 cursor-pointer': $data.publicSince != null },
              userVote > 0 && 'text-orange-500'
            )}
            on:click={() => handleVote(1)}
            disabled={$data.publicSince == null}
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
              { 'hover:text-orange-500 cursor-pointer': $data.publicSince != null },
              userVote < 0 && 'text-orange-500'
            )}
            on:click={() => handleVote(-1)}
            disabled={$data.publicSince == null}
          >
            <CaretDown size={32} />
          </button>
        </div>

        <div class="ml-4">
          <h1 class="text-3xl">{$data.title}</h1>
          <div class="text-gray-600 text-sm flex">
            <p>
              {#if $data.publicSince}
                Created {formatDistanceToNowStrict($data.publicSince)} ago
              {/if}
              by
              {#if $data.creator}
                <a
                  class="font-semibold hover:underline hover:text-blue-500"
                  href="/user/{$data.creator.id}">{$data.creator.username}</a
                >
              {:else}
                [DELETED]
              {/if}
              {#if $data.publicSince == null}
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
          url="https://www.octopuzzles.com/sudoku/{$data?.id}"
          text="Can you solve this?"><TwitterLogo size={24} /></TwitterLink
        >

        <FacebookLink class="w-6 h-6 block" url="https://www.octopuzzles.com/sudoku/{$data?.id}"
          ><FacebookLogo size={24} /></FacebookLink
        >

        <WhatsAppLink
          class="w-6 h-6 block"
          text="Can you solve this? https://www.octopuzzles.com/sudoku/{$data?.id}"
          ><WhatsappLogo size={24} /></WhatsAppLink
        >

        <RedditLink
          class="w-6 h-6 block"
          text="Can you solve this?"
          url="https://www.octopuzzles.com/sudoku/{$data?.id}"><RedditLogo size={24} /></RedditLink
        >

        <button class="w-6 h-6 block" title="Take image of sudoku" on:click={takeScreenshot}
          ><Image size={24} /></button
        >
      </div>
    </div>

    <hr />

    {#if $data.fullLabels}
      <div class="flex gap-2 mb-4">
        {#each $data.fullLabels as label}
          <a href="/?label={label.id}">
            <PuzzleLabel {label} class="hover:bg-gray-200 transition-colors" />
          </a>
        {/each}
      </div>
    {/if}

    <p class="whitespace-pre-line max-w-7xl">{$data.description}</p>

    {#if $data.solution == null}
      <p class="text-gray-800 text-sm mt-4">Info: No solution provided for this puzzle</p>
    {/if}
  </aside>
{/if}
