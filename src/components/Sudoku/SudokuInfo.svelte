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
  import type { User } from '$models/User';
  import type { Vote } from '$models/Vote';
  import type { Label } from '$models/Label';
  import trpc, { type InferQueryOutput } from '$lib/client/trpc';
  import { onMount } from 'svelte';
  import RichTextEditor from '$components/RichTextEditor.svelte';
  import HtmlContent from './HTMLContent.svelte';
  import Button from '$ui/Button.svelte';

  export let sudoku: Sudoku & {
    user?: Pick<User, 'id' | 'username' | 'role'> | null;
    userVote?: Vote | null;
    labels: Label[];
  };
  export let takeScreenshot: () => void;

  onMount(() => {
    getComments();
  });

  let savingComment = false;
  let commentContent = '';

  async function postComment() {
    savingComment = true;
    await trpc().mutation('comments:create', {
      body: commentContent,
      sudokuId: sudoku.id
    });
    commentContent = '';
    savingComment = false;
    await getComments();
  }

  let commentCursor: Date | null | undefined = undefined;
  let comments: InferQueryOutput<'comments:onSudoku'>['comments'] = [];
  async function getComments() {
    const c = await trpc().query('comments:onSudoku', {
      sudokuId: sudoku.id,
      limit: 20,
      cursor: commentCursor ?? undefined
    });
    commentCursor = c.nextCursor;
    comments = c.comments;
  }

  async function vote(value: number) {
    return await trpc().mutation('votes:vote', { sudokuId: sudoku.id, value });
  }

  $: pointsWithoutUserVote = (sudoku.points ?? 0) - (sudoku.userVote?.value ?? 0);

  let userVote = sudoku.userVote == null || sudoku.userVote.value === 0 ? 0 : sudoku.userVote.value;

  async function handleVote(value: 1 | -1): Promise<void> {
    if (sudoku.publicSince) {
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
  <div class="mb-4 flex flex-wrap space-y-4 space-x-4 items-center justify-between">
    <div class="flex items-center">
      <div class="flex flex-col text-sm text-gray-500 items-center">
        <button
          class={classNames(
            'w-8 h-8 transition-colors',
            { 'hover:text-orange-500 cursor-pointer': sudoku.publicSince != null },
            userVote > 0 && 'text-orange-500'
          )}
          on:click={() => handleVote(1)}
          disabled={sudoku.publicSince == null}
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
            { 'hover:text-orange-500 cursor-pointer': sudoku.publicSince != null },
            userVote < 0 && 'text-orange-500'
          )}
          on:click={() => handleVote(-1)}
          disabled={sudoku.publicSince == null}
        >
          <CaretDown size={32} />
        </button>
      </div>

      <div class="ml-4">
        <h1 class="text-3xl">{sudoku.title}</h1>
        <div class="text-gray-600 text-sm flex">
          <p>
            {#if sudoku.publicSince}
              Created {formatDistanceToNowStrict(sudoku.publicSince)} ago
            {/if}
            by
            {#if sudoku.user}
              <a
                class="font-semibold hover:underline hover:text-blue-500"
                href="/user/{sudoku.user.id}">{sudoku.user.username}</a
              >
            {:else}
              [DELETED]
            {/if}
            {#if sudoku.publicSince == null}
              -
              <span class="text-orange-500">NOT PUBLIC</span>
            {/if}
          </p>
        </div>
        {#if sudoku.labels}
          <div class="flex gap-2 pt-2">
            {#each sudoku.labels as label}
              <a href="/?label={label.id}">
                <PuzzleLabel {label} class="hover:bg-gray-200 transition-colors" />
              </a>
            {/each}
          </div>
        {/if}
      </div>
    </div>

    <div class="flex space-x-2">
      <p>Share:</p>
      <TwitterLink
        class="w-6 h-6 block"
        url="https://www.octopuzzles.com/sudoku/{sudoku.id}"
        text="Can you solve this?"><TwitterLogo size={24} /></TwitterLink
      >

      <FacebookLink class="w-6 h-6 block" url="https://www.octopuzzles.com/sudoku/{sudoku.id}"
        ><FacebookLogo size={24} /></FacebookLink
      >

      <WhatsAppLink
        class="w-6 h-6 block"
        text="Can you solve this? https://www.octopuzzles.com/sudoku/{sudoku.id}"
        ><WhatsappLogo size={24} /></WhatsAppLink
      >

      <RedditLink
        class="w-6 h-6 block"
        text="Can you solve this?"
        url="https://www.octopuzzles.com/sudoku/{sudoku.id}"><RedditLogo size={24} /></RedditLink
      >

      <button class="w-6 h-6 block" title="Take image of sudoku" on:click={takeScreenshot}
        ><Image size={24} /></button
      >
    </div>
  </div>

  <hr class="mb-4" />

  <HtmlContent content={sudoku.description} />

  {#if sudoku.solution == null}
    <p class="text-gray-800 text-sm mt-4">Info: No solution provided for this puzzle</p>
  {/if}

  <h2 class="mt-8 font-semibold mb-2">Comments</h2>
  <ul class="space-y-2">
    <li class="rounded-lg shadow border p-2">
      <h6>Write a new comment</h6>
      <RichTextEditor bind:content={commentContent} placeholder="New comment" />
      <div class="flex w-full justify-end mt-2">
        <Button
          loading={savingComment}
          variant="primary"
          on:click={() => {
            void postComment();
          }}>Save</Button
        >
      </div>
    </li>
    {#if comments.length > 0}
      {#each comments as comment}
        <li class="rounded-lg shadow border p-2">
          <div class="flex gap-2 items-center mb-2">
            <h6 class="font-semibold">{comment.user.username}</h6>
            <span class="text-sm text-gray-500"
              >created {formatDistanceToNowStrict(comment.createdAt)} ago</span
            >
          </div>
          <HtmlContent content={comment.body} />
        </li>
      {/each}
    {:else}
      <li class="text-gray-700 mt-2">No comments</li>
    {/if}
  </ul>
</aside>
