<script lang="ts">
  import Button from '$ui/Button.svelte';
  import Input from '$ui/Input.svelte';
  import {
    defaultBorderclues,
    defaultCellclues,
    defaultCells,
    defaultCentermarks,
    defaultCornermarks,
    defaultEditorColors,
    defaultGameColors,
    defaultGivens,
    defaultCages,
    defaultPaths,
    defaultValues,
    defaultRegions
  } from '$utils/defaults';
  import { setMargins } from '$stores/sudokuStore';
  import type { Dimensions } from '$models/Sudoku';
  import { getSudokuEditorContext, getSudokuGameContext } from '$utils/context/sudoku';

  const editorHistory = getSudokuEditorContext();
  const gameHistory = getSudokuGameContext();

  let dimensions = editorHistory.subscribeToClue('dimensions');

  let marginLeft = String($dimensions.margins ? $dimensions.margins.left : 0);
  let marginRight = String($dimensions.margins ? $dimensions.margins.right : 0);
  let marginTop = String($dimensions.margins ? $dimensions.margins.top : 0);
  let marginBottom = String($dimensions.margins ? $dimensions.margins.bottom : 0);
  let rows = String(
    $dimensions.rows -
      ($dimensions.margins ? $dimensions.margins.top + $dimensions.margins.bottom : 0)
  );
  let columns = String(
    $dimensions.columns -
      ($dimensions.margins ? $dimensions.margins.left + $dimensions.margins.right : 0)
  );

  function update(): void {
    let newDimensions: Dimensions = {
      rows: parseInt(rows) + parseInt(marginTop) + parseInt(marginBottom),
      columns: parseInt(columns) + parseInt(marginLeft) + parseInt(marginRight),
      margins:
        parseInt(marginLeft + marginRight + marginTop + marginBottom) > 0
          ? {
              left: parseInt(marginLeft),
              right: parseInt(marginRight),
              top: parseInt(marginTop),
              bottom: parseInt(marginBottom)
            }
          : undefined
    };

    if (
      rows !==
        String(
          $dimensions.rows -
            ($dimensions.margins ? $dimensions.margins.top + $dimensions.margins.bottom : 0)
        ) ||
      columns !=
        String(
          $dimensions.columns -
            ($dimensions.margins ? $dimensions.margins.left + $dimensions.margins.right : 0)
        )
    ) {
      gameHistory.set({
        values: defaultValues(newDimensions),
        centermarks: defaultCentermarks(newDimensions),
        cornermarks: defaultCornermarks(newDimensions),
        colors: defaultGameColors(newDimensions)
      });
      editorHistory.set({
        dimensions: newDimensions,
        borderclues: defaultBorderclues(),
        cellclues: defaultCellclues(),
        colors: defaultEditorColors(newDimensions),
        extendedcages: defaultCages(),
        givens: defaultGivens(newDimensions),
        paths: defaultPaths(),
        cells: defaultCells(newDimensions),
        regions: defaultRegions(newDimensions)
      });
    } else {
      let frameChanged = false;
      if ($dimensions.margins == null) {
        frameChanged = newDimensions.margins !== null;
      } else if (newDimensions.margins !== null) {
        frameChanged =
          newDimensions.margins?.left !== $dimensions.margins?.left ||
          newDimensions.margins?.right !== $dimensions.margins?.right ||
          newDimensions.margins?.top !== $dimensions.margins?.top ||
          newDimensions.margins?.bottom !== $dimensions.margins?.bottom;
      } else {
        frameChanged = true;
      }
      if (frameChanged) {
        setMargins(newDimensions.margins);
      }
    }
  }
</script>

<div class="p-2">
  <div class="flex justify-center items-center w-full h-full p-2">
    <div class="grid grid-cols-2 grid-rows-3 gap-2">
      <div>
        <Input
          label="Rows"
          bind:value={rows}
          min="1"
          max="26"
          type="number"
          on:input={() => (columns = rows)}
        />
      </div>
      <div><Input label="Columns" bind:value={columns} min="1" max="26" type="number" /></div>
      <div>
        <Input label="Left Margin" bind:value={marginLeft} min="0" max="10" type="number" />
      </div>
      <div>
        <Input label="Right Margin" bind:value={marginRight} min="0" max="10" type="number" />
      </div>
      <div><Input label="Top Margin" bind:value={marginTop} min="0" max="10" type="number" /></div>
      <div>
        <Input label="Bottom Margin" bind:value={marginBottom} min="0" max="10" type="number" />
      </div>
    </div>
  </div>
  <Button class="mt-3 w-full" on:click={() => update()}>Update</Button>
</div>
