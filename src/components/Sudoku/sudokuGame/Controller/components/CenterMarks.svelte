<script lang="ts">
  import Backspace from 'phosphor-svelte/lib/Backspace/Backspace.svelte';
  import { get } from 'svelte/store';
  import deepCopy from '$utils/deepCopy';
  import SquareButton from '$ui/SquareButton.svelte';
  import { isDeleteKey } from '$utils/isDeleteKey';
  import { hasOpenModals } from '$stores/modalStore';
  import {
    getSudokuBeingPlayedContext,
    getSudokuGameContext,
    getSudokuInteractionModeContext
  } from '$utils/context/sudoku';

  const sudoku = getSudokuBeingPlayedContext();
  const gameHistory = getSudokuGameContext();
  const interactionMode = getSudokuInteractionModeContext();
  const { selectedCells } = interactionMode as NonNullable<typeof interactionMode>;

  const handleClick = (newCentermark: string): void => {
    let currentCentermarks = gameHistory.getValue('centermarks');
    let newCentermarks = deepCopy(currentCentermarks);
    let positions = deepCopy(get(selectedCells));

    positions =
      sudoku.givens != null
        ? positions.filter((p) => sudoku.givens[p.row][p.column] === '')
        : positions;
    if (positions.length === 0) return;

    const clearAllGameCells =
      newCentermark === '' && positions.every((p) => currentCentermarks[p.row][p.column] === '');
    if (clearAllGameCells) {
      // clear all the cells in the game
      gameHistory.clearCells(positions);
      return;
    }

    let allCellsHasCenterMark = positions.every((p) =>
      currentCentermarks[p.row][p.column].includes(newCentermark)
    );

    if (!allCellsHasCenterMark) {
      // Add it to the cells that does not have it
      positions.forEach((p) => {
        if (!currentCentermarks[p.row][p.column].includes(newCentermark)) {
          newCentermarks[p.row][p.column] = (currentCentermarks[p.row][p.column] + newCentermark)
            .split('')
            .sort()
            .join('');
        }
      });
    } else {
      // Remove it from all cells
      positions.forEach((p) => {
        newCentermarks[p.row][p.column] = currentCentermarks[p.row][p.column]
          .split('')
          .filter((s) => s !== newCentermark)
          .sort()
          .join('');
      });
    }

    gameHistory.set({ centermarks: newCentermarks });
  };

  function handleKeyDown(k: KeyboardEvent): void {
    //do not accept keyboard input when any modal controls are open
    if (hasOpenModals()) return;

    if (isDeleteKey(k)) {
      k.preventDefault();
      handleClick('');
    } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(k.key)) {
      handleClick(k.key);
    }
  }
</script>

<svelte:window on:keydown={handleKeyDown} />

<div class="w-full h-full flex justify-center items-center">
  <div class="grid grid-cols-3 grid-rows-4 h-max w-max m-auto p-4 gap-4">
    {#each [1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as i}
      <div>
        <SquareButton
          variant="secondary"
          text={String(i)}
          on:click={() => handleClick(String(i))}
        />
      </div>
    {/each}
    <div class="col-span-2">
      <SquareButton class="w-36 p-3" on:click={() => handleClick('')}>
        <Backspace size={32} />
      </SquareButton>
    </div>
  </div>
</div>
