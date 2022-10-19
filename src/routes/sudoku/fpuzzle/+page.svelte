<script lang="ts">
	import { goto } from '$app/navigation';

	import { page } from '$app/stores';
	import SudokuGame from '$components/Sudoku/Game.svelte';
	import { description, editorHistory, gameHistory, sudokuTitle } from '$stores/sudokuStore';
	import { decompressFromBase64 } from '$utils/compressor';
	import { defaultValues } from '$utils/defaults';
	import { importFPuzzleIntoEditorHistory } from '$utils/importFPuzzleIntoEditor';
	import { onMount } from 'svelte';
	import { get } from 'svelte/store';

	// TIMER: one that does not run when the tab is inactive, but runs as if it had.
	let now = Date.now();
	const start = Date.now();
	let timer: ReturnType<typeof setInterval>;
	let loading = true;

	$: t = Math.floor((now - start) / 1000);

	$: seconds = `0${t % 60}`.slice(-2);
	$: minutes = `0${Math.floor(t / 60) % 60}`.slice(-2);
	$: hours = t >= 3600 ? `0${Math.floor(t / 3600) % 24}`.slice(-2) + ':' : '';
	$: days = t >= 86400 ? Math.floor(t / 86400) + 'd' : '';

	// When the page is not visible, the timer should not run, but it should also not stop, but be incremented by the number of seconds the user was off screen
	function handleVisibilityChange(): void {
		if (document.hidden) {
			clearInterval(timer);
		} else {
			timer = setInterval(() => {
				now = Date.now();
			}, 1000);
		}
	}
	onMount(() => {
		timer = setInterval(() => {
			now = Date.now();
		}, 1000);
		document.addEventListener('visibilitychange', handleVisibilityChange);
	});

	onMount(async () => {
		loading = true;
		const encodedString = $page.url.searchParams.get('fpuzzle');
		if (encodedString == null) {
			await goto('/');
			return;
		}
		const withPlusses = encodedString.replace(/ /g, '+');

		const jsonString = decompressFromBase64(withPlusses);

		if (jsonString == null) {
			await goto('/');
			return;
		}

		importFPuzzleIntoEditorHistory(jsonString);

		let dim = get(editorHistory.getClue('dimensions'));
		gameHistory.set({ values: defaultValues(dim) });
		loading = false;
	});

	let givens = editorHistory.getClue('givens');
	let borderClues = editorHistory.getClue('borderclues');
	let cellClues = editorHistory.getClue('cellclues');
	let regions = editorHistory.getClue('regions');
	let cells = editorHistory.getClue('cells');
	let editorColors = editorHistory.getClue('editorcolors');
	let cages = editorHistory.getClue('cages');
	let paths = editorHistory.getClue('paths');
	let dimensions = editorHistory.getClue('dimensions');
	let logic = editorHistory.getClue('logic');

	let values = gameHistory.getValue('values');
	let gameColors = gameHistory.getValue('colors');
	let cornermarks = gameHistory.getValue('cornermarks');
	let centermarks = gameHistory.getValue('centermarks');
	let notes = gameHistory.getValue('notes');
</script>

<svelte:head>
	<title>{$sudokuTitle ?? 'Sudoku'} | OctoPuzzles</title>
	<meta name="description" content={$description} />
	<meta property="og:image" content="https://octopuzzles.com/favicon.png" />
	<meta property="og:description" content={$description} />
	<meta property="og:title" content="{$sudokuTitle} | OctoPuzzles" />
</svelte:head>

{#if !loading}
	<!-- Header -->
	<div class="flex items-center justify-center h-20 absolute top-0 w-full pointer-events-none">
		<div class="flex flex-col items-center">
			<h1 class="text-xl font-medium text-center w-96 md:w-auto truncate">
				{$sudokuTitle}
			</h1>
			<span>
				{days}
				{hours}{minutes}:{seconds}
			</span>
		</div>
	</div>

	<SudokuGame
		givens={$givens}
		borderClues={$borderClues}
		cellClues={$cellClues}
		regions={$regions}
		cells={$cells}
		editorColors={$editorColors}
		cages={$cages}
		paths={$paths}
		dimensions={$dimensions}
		logic={$logic}
		values={$values}
		gameColors={$gameColors}
		cornermarks={$cornermarks}
		centermarks={$centermarks}
		notes={$notes}
	/>

	<div class="p-4 whitespace-pre-line">
		{$description}
	</div>
{/if}
