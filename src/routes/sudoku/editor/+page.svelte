<script context="module" lang="ts">
	export function SudokuToUpdateVariables(page: LoadInput): SudokuToUpdate$input {
		return {
			id: page.url.searchParams.get('id')
		};
	}
</script>

<script lang="ts">
	import SudokuGame from '$components/Sudoku/Game.svelte';
	import { graphql, mutation, query } from '$houdini';
	import type {
		UpdateSudoku,
		RemoveThisSudoku,
		ChangeSudokuUpdate,
		CreateSudoku,
		SudokuToUpdate,
		SudokuToUpdate$input,
		UpdateSudoku$input,
		NewSudokuInput,
		ProvideSolutionToPuzzle,
		Labels,
		CreateOrUpdateWalkthrough,
		DeleteWalkthrough
	} from '$houdini';
	import Button from '$ui/Button.svelte';
	import Input from '$ui/Input.svelte';
	import RadioGroup from '$ui/RadioGroup.svelte';
	import toErrorMap from '$utils/toErrorMap';
	import { onMount } from 'svelte';
	import type { LoadInput } from '@sveltejs/kit';
	import { goto } from '$app/navigation';
	import {
		defaultCentermarks,
		defaultCornermarks,
		defaultGameColors,
		defaultValues
	} from '$utils/defaults';
	import { page } from '$app/stores';
	import { openModal } from '$stores/modalStore';
	import CommonDescriptionsModal from '$components/Sudoku/CommonDescriptionsModal.svelte';
	import { Plus } from 'phosphor-svelte';
	import { getUserSolution } from '$utils/getSolution';
	import {
		description,
		editorHistory,
		gameHistory,
		sudokuTitle,
		labels,
		mode
	} from '$stores/sudokuStore';
	import Label from '$ui/Label.svelte';
	import classNames from 'classnames';
	import {
		getAllBorderClues,
		getAllCages,
		getAllCellClues,
		isDefaultBorders
	} from '$utils/migration';
	import ImportFromFPuzzles from '$components/Modals/ImportFromFPuzzles.svelte';
	import { walkthroughStore } from '$stores/walkthroughStore';
	import WalkthroughComponent from '$components/Walkthrough.svelte';

	const createSudoku = mutation<CreateSudoku>(graphql`
		mutation CreateSudoku($newSudokuInput: NewSudokuInput!) {
			createSudoku(newSudokuInput: $newSudokuInput) {
				errors {
					field
					message
				}
				sudoku {
					id
				}
			}
		}
	`);

	const updateSudoku = mutation<UpdateSudoku>(graphql`
		mutation UpdateSudoku($id: ObjectId!, $updateSudokuInput: UpdateSudokuInput!) {
			updateSudoku(id: $id, updateSudokuInput: $updateSudokuInput) {
				errors {
					field
					message
				}
				sudoku {
					id
				}
			}
		}
	`);

	const { data: sudokuToUpdate } = query<SudokuToUpdate>(graphql`
		query SudokuToUpdate($id: ObjectId) {
			sudoku(id: $id) {
				id
				title
				userId
				publicSince
				description
				dimensions {
					rows
					columns
					margins {
						left
						right
						top
						bottom
					}
				}
				cells
				givens
				cornerclues {
					nw
					ne
					se
					sw
				}
				colors
				regions {
					positions {
						column
						row
					}
					type
					borders
					color
				}
				borders {
					x1
					y1
					x2
					y2
				}
				killercages {
					column
					row
				}
				extendedcages {
					positions {
						column
						row
					}
					type
					text
					color
				}
				paths {
					positions {
						column
						row
					}
					type
					color
					width
					form
					fill
					arrow
				}
				borderclues {
					positions {
						column
						row
					}
					type
					shape
					color
					radius
					text
				}
				cellclues {
					position {
						column
						row
					}
					type
					location
					text
					size
					symbol
					rotation
					color
				}
				symbols {
					type
					rotation
					color
				}
				logic {
					digits
					flags
				}
				solution {
					numbers
				}
				labels
			}
		}
	`);

	const changeSudokuUpdate = mutation<ChangeSudokuUpdate>(graphql`
		mutation ChangeSudokuUpdate($id: ObjectId!, $public: Boolean!) {
			changeSudokuPublicStatus(id: $id, public: $public)
		}
	`);

	const { data: labelsData } = query<Labels>(graphql`
		query Labels {
			labels {
				id
				name
				description
			}
		}
	`);

	async function changeUpdateStatus(make_public: boolean): Promise<void> {
		loading = true;
		if (id) {
			try {
				const res = await changeSudokuUpdate({ id, public: make_public });
				if (res) {
					isPublic = res.changeSudokuPublicStatus;
				}
			} catch (e) {
				console.error(e);
			}
		}
		loading = false;
	}

	const removeSudoku = mutation<RemoveThisSudoku>(graphql`
		mutation RemoveThisSudoku($id: ObjectId!) {
			deleteSudoku(id: $id) {
				...Users_Sudoku_remove
			}
		}
	`);

	const provideSolutionToPuzzle = mutation<ProvideSolutionToPuzzle>(graphql`
		mutation ProvideSolutionToPuzzle($id: ObjectId!, $solution: SolutionInput) {
			provideSolutionToPuzzle(id: $id, solution: $solution) {
				sudoku {
					id
				}
				errors {
					field
					message
				}
			}
		}
	`);

	const createOrUpdateWalkthrough = mutation<CreateOrUpdateWalkthrough>(graphql`
		mutation CreateOrUpdateWalkthrough($sudokuId: ObjectId!, $steps: [WalkthroughStepInput!]!) {
			createOrUpdateWalkthrough(sudokuId: $sudokuId, steps: $steps)
		}
	`);

	const deleteWalkthrough = mutation<DeleteWalkthrough>(graphql`
		mutation DeleteWalkthrough($sudokuId: ObjectId!) {
			deleteWalkthrough(sudokuId: $sudokuId)
		}
	`);

	async function saveSolution(id: string): Promise<void> {
		// create solution
		if (provideSolution) {
			let solution = getUserSolution({ givens: $givens, values: $values });

			await provideSolutionToPuzzle({ id, solution: { numbers: solution } });
		} else {
			await provideSolutionToPuzzle({ id, solution: null });
		}
	}

	onMount(async () => {
		let sud = $sudokuToUpdate?.sudoku;

		gameHistory.reset();
		$labels =
			$labelsData?.labels.map((l) => ({
				label: l,
				selected: sud?.labels?.includes(l.id) ?? false
			})) ?? [];
		if (sud) {
			$sudokuTitle = sud.title;
			$description = sud.description;
			id = sud.id;
			provideSolution = sud.solution != null;
			isPublic = sud.publicSince != null;
			gameHistory.set({
				values: defaultValues(sud.dimensions),
				centermarks: defaultCentermarks(sud.dimensions),
				cornermarks: defaultCornermarks(sud.dimensions),
				colors: defaultGameColors(sud.dimensions)
			});
			editorHistory.reset({
				borderclues: getAllBorderClues(sud.borderclues, sud.borders, sud.dimensions) ?? undefined,
				cellclues: getAllCellClues(sud.cellclues, sud.cornerclues, sud.symbols) ?? undefined,
				regions: sud.regions ?? (!isDefaultBorders(sud.borders, sud.dimensions) ? [] : undefined),
				givens: sud.givens ?? undefined,
				cells: sud.cells ?? undefined,
				editorcolors: sud.colors ?? undefined,
				cages: getAllCages(sud.extendedcages, sud.killercages) ?? undefined,
				paths: sud.paths ?? undefined,
				dimensions: sud.dimensions,
				logic: sud.logic ?? undefined
			});
			if (sud.solution) {
				gameHistory.set({
					values: sud.solution.numbers
				});
			}
		} else {
			$sudokuTitle = '';
			$description = '';

			editorHistory.reset();
		}

		if ($page.url.searchParams.get('import')) {
			openModal(ImportFromFPuzzles);
		}
	});

	type Tabs = 'editor' | 'game' | 'form';
	let tab: Tabs = 'editor';
	$: if (tab === 'editor') {
		$mode = 'editor';
	} else {
		$mode = 'game';
	}

	let id: string | undefined = undefined;
	let isPublic = false;
	let errors: Record<string, string> = {};
	let loading = false;
	let provideSolution = false;

	let givens = editorHistory.getClue('givens');
	let borderclues = editorHistory.getClue('borderclues');
	let cellclues = editorHistory.getClue('cellclues');
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

	function generateSudokuForQuery(): UpdateSudoku$input['updateSudokuInput'] {
		return {
			title: $sudokuTitle,
			description: $description,
			dimensions: $dimensions,
			borderclues: $borderclues,
			cellclues: $cellclues,
			regions: $regions,
			cells: $cells,
			colors: $editorColors,
			givens: $givens,
			extendedcages: $cages,
			paths: $paths,
			logic: $logic,
			labels: $labels.filter((l) => l.selected).map((l) => l.label.id)
		};
	}

	async function save(): Promise<void> {
		loading = true;
		errors = {};
		try {
			const res = await createSudoku({
				newSudokuInput: generateSudokuForQuery() as NewSudokuInput
			});

			if (res?.createSudoku.errors) {
				errors = toErrorMap(res.createSudoku.errors);
			} else if (res?.createSudoku.sudoku) {
				id = res.createSudoku.sudoku.id;
				$page.url.searchParams.set('id', id);
				if (provideSolution) {
					await saveSolution(id);
				}

				if ($walkthroughStore.length > 0) {
					await createOrUpdateWalkthrough({
						sudokuId: res.createSudoku.sudoku.id,
						steps: $walkthroughStore
					});
				}
			}
		} catch (e) {
			console.error(e);
			if (Array.isArray(e)) {
				e.forEach((error) => (errors.sudoku = error.message));
			}
		} finally {
			loading = false;
		}
	}

	async function update(): Promise<void> {
		loading = true;
		if (!id) return;
		errors = {};
		try {
			const res = await updateSudoku({
				id,
				updateSudokuInput: generateSudokuForQuery()
			});

			if (res?.updateSudoku.errors) {
				errors = toErrorMap(res.updateSudoku.errors);
			} else if (res?.updateSudoku.sudoku) {
				id = res.updateSudoku.sudoku.id;
				await saveSolution(id);

				if ($walkthroughStore.length > 0) {
					await createOrUpdateWalkthrough({
						sudokuId: res.updateSudoku.sudoku.id,
						steps: $walkthroughStore
					});
				} else {
					await deleteWalkthrough({ sudokuId: res.updateSudoku.sudoku.id });
				}
			}
		} catch (e) {
			console.error(e);
		} finally {
			loading = false;
		}
	}

	function openAddDescriptionModal(): void {
		openModal(CommonDescriptionsModal, {
			addLabel: (l) => {
				if ($description.length === 0) {
					$description = `${l.name}: ${l.description}`;
				} else {
					$description = `${$description}\n\n${l.name}: ${l.description}`;
				}
				let newLabels = $labels;
				newLabels.map((label) => {
					if (l.id === label.label.id) {
						label.selected = true;
						return label;
					} else {
						return label;
					}
				});
				$labels = newLabels;
				return $description;
			},
			currentDescription: $description
		});
	}

	async function deleteSudoku(): Promise<void> {
		loading = true;
		if (id) {
			await removeSudoku({ id: id });
			await goto('/');
		}
		loading = false;
	}

	function doesSolutionHaveHoles(): boolean {
		if (!$givens || !$values) return false;

		let userSolution = getUserSolution({ givens: $givens, values: $values });

		for (const row of userSolution) {
			for (const cell of row) {
				if (cell.length === 0) {
					return true;
				}
			}
		}

		return false;
	}

	let solutionHasHoles = false;
	$: if ($values && $givens) {
		solutionHasHoles = doesSolutionHaveHoles();
	}
</script>

<div class="flex items-center justify-center h-20 absolute top-0 w-full pointer-events-none">
	<div class="max-w-48 pointer-events-auto">
		<RadioGroup
			options={{ editor: 'Editor', game: 'Solution', form: 'Details' }}
			bind:value={tab}
			onChange={undefined}
		/>
	</div>
</div>

{#if tab === 'editor'}
	<SudokuGame
		givens={$givens}
		borderClues={$borderclues}
		cellClues={$cellclues}
		regions={$regions}
		cells={$cells}
		editorColors={$editorColors}
		cages={$cages}
		paths={$paths}
		dimensions={$dimensions}
		logic={$logic}
		values={[]}
		gameColors={[]}
		cornermarks={[]}
		centermarks={[]}
		notes={[]}
	/>
{:else if tab === 'game'}
	<SudokuGame
		givens={$givens}
		borderClues={$borderclues}
		cellClues={$cellclues}
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
{:else}
	<div class="m-auto container p-4">
		<form>
			<h1 class="text-3xl mb-2">Details</h1>
			{#if isPublic}
				<p class="text-green-500">Public</p>
			{/if}
			{#if errors}
				<ul class="mb-2">
					{#each Object.entries(errors) as [field, message]}
						{#if !['title', 'description'].includes(field)}
							<li class="text-red-500"><strong>{field}</strong>: {message}</li>
						{/if}
					{/each}
				</ul>
			{/if}

			<Input label="Title" bind:value={$sudokuTitle} placeholder="My sudoku">
				<p slot="error">{errors.title ? errors.title : ''}</p>
			</Input>
			<div class="relative">
				<button
					class="absolute top-8 p-1 right-2 w-6 h-6 rounded-full border border-orange-500 text-orange-500 bg-orange-100 hover:bg-orange-200 hover:text-orange-600 transition-colors shadow flex items-center justify-center"
					title="Add common descriptions"
					type="button"
					on:click={openAddDescriptionModal}><Plus size={24} /></button
				>
				<Input
					label="Description"
					bind:value={$description}
					asTextarea
					placeholder="Normal sudoku rules apply..."
				>
					<p slot="error">
						{errors.description ? errors.description : ''}
					</p>
				</Input>
			</div>

			<label
				class="flex items-center gap-2 mt-2"
				title="Save the solution given in the solution tab as the right solution"
			>
				<input type="checkbox" class="rounded text-blue-500" bind:checked={provideSolution} />
				<p>Provide the numbers in your solution as the correct solution</p>
				{#if provideSolution && solutionHasHoles}
					<p class="text-orange-500">
						Your solution has cells without numbers. If intentional, ignore this
					</p>
				{/if}
			</label>

			<h1 class="font-semibold mt-8">Labels</h1>
			<p class="mb-2">Pick the labels that match your puzzle</p>
			<div class="flex flex-wrap gap-2">
				{#each $labels as label}
					<Label
						class={classNames('cursor-pointer p-2 rounded-md shadow w-52', {
							'ring-blue-500 ring-2': label.selected,
							'ring-gray-300 ring-1': !label.selected
						})}
					>
						<h6 class="font-semibold">{label.label.name}</h6>
						<p>{label.label.description}</p>
						<input
							type="checkbox"
							class="rounded text-blue-500 hidden"
							bind:checked={label.selected}
						/>
					</Label>
				{/each}
			</div>

			<div class="mt-8 w-full flex justify-between">
				<div>
					{#if id}
						<Button type="button" {loading} variant="primary" on:click={() => update()}>
							Update
						</Button>

						{#if isPublic}
							<Button
								type="button"
								class="bg-yellow-500"
								{loading}
								on:click={() => changeUpdateStatus(false)}>Depublish</Button
							>
						{:else}
							<Button type="button" {loading} on:click={() => changeUpdateStatus(true)}
								>Publish</Button
							>

							<a href="/sudoku/{id}"><Button type="button">Go to pre-release puzzle</Button></a>
						{/if}
					{:else}
						<Button type="button" {loading} variant="primary" on:click={() => save()}>Save</Button>
					{/if}
				</div>
				<div class="flex gap-2">
					{#if id}
						<Button variant="danger" {loading} on:click={deleteSudoku}>Delete</Button>
					{/if}
				</div>
			</div>
		</form>
	</div>
{/if}

{#if id}
	<WalkthroughComponent sudokuId={id} />
{/if}
