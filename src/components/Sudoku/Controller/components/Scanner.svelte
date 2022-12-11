<script lang="ts">
  import SquareButton from '$ui/SquareButton.svelte';
  import Play from '$icons/Play.svelte';
  import Pause from '$icons/Pause.svelte';
  import Step from '$icons/Step.svelte';
  import AutoScan from '$icons/AutoScan.svelte';
  import {
    editorHistory,
    gameHistory,
    handleArrows,
    handleMouseDown,
    handleMouseEnter,
    selectedCells,
    highlightedCells
  } from '$stores/sudokuStore';
  import { onMount } from 'svelte';
  import Label from '$ui/Label.svelte';
  import RadioGroup from '$ui/RadioGroup.svelte';
  import Checkbox from '$ui/Checkbox.svelte';
  import { cageDefaults, pathDefaults, regionDefaults } from '$utils/prefabs';
  import { defaultRegionSize } from '$utils/defaults';
  import type { Position } from '$models/Sudoku';
  import type { ScannerSettings } from '$models/User';

  import { me } from '$stores/meStore';
  import {
    defaultHandleArrows,
    defaultHandleMouseDown,
    defaultHandleMouseEnter
  } from '$stores/sudokuStore/interactionHandlers';
  import deepCopy from '$utils/deepCopy';

  let scannerSettings: ScannerSettings = me.getSettings().scanner ?? {};
  let highlightMode = scannerSettings.highlightMode ?? 'Seen';
  let mode = scannerSettings.mode ?? 'Basic';
  let autoScan = scannerSettings.autoScan ?? false;
  let scannerSpeed = scannerSettings.scannerSpeed ?? 'Slow';
  let useCentreMarks = scannerSettings.useCentreMarks ?? true;
  let useCornerMarks = scannerSettings.useCornerMarks ?? true;
  let scanDiagonals = scannerSettings.scanDiagonals ?? true;
  let scanAntiKnight = scannerSettings.scanAntiKnight ?? true;
  let scanAntiKing = scannerSettings.scanAntiKing ?? true;
  let scanDisjointSets = scannerSettings.scanDisjointSets ?? true;
  let scanCages = scannerSettings.scanCages ?? true;
  let scanPaths = scannerSettings.scanPaths ?? true;
  let scanExtraRegions = scannerSettings.scanExtraRegions ?? true;
  let scanNegativeXV = scannerSettings.scanNegativeXV ?? true;
  let scanNegativeKropki = scannerSettings.scanNegativeKropki ?? true;
  let scanNonConsecutive = scannerSettings.scanNonConsecutive ?? true;
  let scanEntropy = scannerSettings.scanEntropy ?? true;

  let dimensions = editorHistory.getClue('dimensions');
  let givens = editorHistory.getClue('givens');
  let cells = editorHistory.getClue('cells');
  let regions = editorHistory.getClue('regions');
  let cages = editorHistory.getClue('cages');
  let paths = editorHistory.getClue('paths');
  let logic = editorHistory.getClue('logic');

  const rowOffset = $dimensions.margins?.top ?? 0;
  const columnOffset = $dimensions.margins?.left ?? 0;
  const rows = $dimensions.rows - rowOffset - ($dimensions.margins?.bottom ?? 0);
  const columns = $dimensions.columns - columnOffset - ($dimensions.margins?.right ?? 0);
  const { width, height } = defaultRegionSize($dimensions);

  let digits = $logic.digits ?? '1-' + rows;
  let flags = $logic.flags ?? [];
  let nonstandard = flags.indexOf('NonStandard') !== -1;
  let diagonalPos = flags.indexOf('DiagonalPos') !== -1;
  let diagonalNeg = flags.indexOf('DiagonalNeg') !== -1;
  let antiknight = flags.indexOf('Antiknight') !== -1;
  let antiking = flags.indexOf('Antiking') !== -1;
  let disjointsets = flags.indexOf('DisjointSets') !== -1;
  let sCells = flags.indexOf('SCells') !== -1;
  let nonconsecutive = flags.indexOf('Nonconsecutive') !== -1;
  let entropy = flags.indexOf('Entropy') !== -1;
  let negativeX = flags.indexOf('NegativeX') !== -1;
  let negativeV = flags.indexOf('NegativeV') !== -1;
  let negativeBlack = flags.indexOf('NegativeBlack') !== -1;
  let negativeWhite = flags.indexOf('NegativeWhite') !== -1;

  let values = gameHistory.getValue('values');
  let centermarks = gameHistory.getValue('centermarks');
  let cornermarks = gameHistory.getValue('cornermarks');

  let allDigits: string[] = [];
  let candidates: string[][][] = [];
  let queue: Position[] = [];

  let playing = false;

  function updateSettings(): void {
    scannerSettings = {
      highlightMode,
      mode,
      scannerSpeed,
      autoScan,
      useCentreMarks,
      useCornerMarks,
      scanDiagonals,
      scanAntiKnight,
      scanAntiKing,
      scanDisjointSets,
      scanCages,
      scanPaths,
      scanExtraRegions,
      scanNegativeXV,
      scanNegativeKropki,
      scanNonConsecutive,
      scanEntropy
    };
    me.saveSettings({ scanner: scannerSettings });

    updateHighlightedCells();
  }

  function init(): void {
    allDigits = digits.split('');
    for (let n = allDigits.length - 1; n >= 0; --n) {
      if (allDigits[n] === ';' || allDigits[n] === ' ') {
        allDigits.splice(n, 1);
        continue;
      }
      if (allDigits[n] === '-') {
        let range: string[] = [];
        if (n > 0 && n < allDigits.length - 1) {
          let start = allDigits[n - 1].charCodeAt(0);
          let end = allDigits[n + 1].charCodeAt(0);
          let char = start + 1;
          while (char < end) {
            range.push(String.fromCharCode(char));
            ++char;
          }
        }
        allDigits.splice(n, 1, ...range);
      }
    }
  }

  function findCandidates(): void {
    candidates = [];
    queue = [];

    for (let i = 0; i < rows; ++i) {
      const row = i + rowOffset;

      candidates[row] = [];

      for (let j = 0; j < columns; ++j) {
        const column = j + columnOffset;

        if ($givens[row][column] === '' && $values[row][column] === '') {
          queue.push({ row, column });

          if ($centermarks[row][column].length) {
            candidates[row][column] = $centermarks[row][column].split('');
          } else {
            candidates[row][column] = [...allDigits];
          }
        }
      }
    }
  }

  function getSeenCells(cell: Position): { row: number; column: number; context: string }[] {
    const seen: { row: number; column: number; context: string }[] = [];

    const i = cell.row - rowOffset;
    const j = cell.column - columnOffset;

    if (!nonstandard) {
      for (let x = 0; x < rows; ++x) {
        if (x != j)
          seen.push({
            row: cell.row,
            column: x + columnOffset,
            context: 'ROW'
          });
      }

      for (let y = 0; y < rows; ++y) {
        if (y !== i)
          seen.push({
            row: y + rowOffset,
            column: cell.column,
            context: 'COLUMN'
          });
      }
    }

    $regions.forEach((r) => {
      if (r.type === 'Normal' && (r.uniqueDigits ?? !nonstandard)) {
        if (r.positions.some((p) => p.row === cell.row && p.column === cell.column)) {
          r.positions.forEach((p) => {
            if (p.row === cell.row && p.column === cell.column) return;

            seen.push({ row: p.row, column: p.column, context: 'REGION' });
          });
        }
      }
    });

    if (mode !== 'Basic') {
      if (diagonalNeg && scanDiagonals) {
        if (i === j) {
          for (let k = 0; k < rows; ++k) {
            if (k !== i)
              seen.push({
                row: k + rowOffset,
                column: k + columnOffset,
                context: 'DIAGONAL-'
              });
          }
        }
      }
      if (diagonalPos && scanDiagonals) {
        if (i === rows - 1 - j) {
          for (let k = 0; k < rows; ++k) {
            if (k !== i)
              seen.push({
                row: k + rowOffset,
                column: rows - 1 - k + columnOffset,
                context: 'DIAGONAL+'
              });
          }
        }
      }
      if (antiking && scanAntiKing) {
        [-1, 1].forEach((y) => {
          [-1, 1].forEach((x) => {
            if (i + y < 0 || i + y >= rows) return;
            if (j + x < 0 || j + x >= columns) return;

            seen.push({
              row: i + y + rowOffset,
              column: j + x + columnOffset,
              context: 'ANTIKING'
            });
          });
        });
      }
      if (antiknight && scanAntiKnight) {
        [-2, -1, 1, 2].forEach((y) => {
          [-2, -1, 1, -2].forEach((x) => {
            if (Math.abs(y) === Math.abs(x)) return;
            if (i + y < 0 || i + y >= rows) return;
            if (j + x < 0 || j + x >= columns) return;

            seen.push({
              row: i + y + rowOffset,
              column: j + x + columnOffset,
              context: 'ANTIKNIGHT'
            });
          });
        });
      }
      if (disjointsets && scanDisjointSets) {
        for (let m = 0; m < rows / height; ++m) {
          for (let n = 0; m < columns / width; ++n) {
            if (Math.floor(i / height) !== m || Math.floor(j / width) !== n) {
              seen.push({
                row: (i % height) + m * height + rowOffset,
                column: (j % width) + n * width + columnOffset,
                context: 'DISJOINTSET'
              });
            }
          }
        }
      }
      if (scanCages) {
        $cages.forEach((c, n) => {
          if (c.uniqueDigits ?? cageDefaults(c.type ?? 'CUSTOM').uniqueDigits) {
            if (c.positions.some((p) => p.row === cell.row && p.column === cell.column)) {
              c.positions.forEach((p) => {
                if (p.row === cell.row && p.column === cell.column) return;

                seen.push({
                  row: p.row,
                  column: p.column,
                  context: 'CAGE:' + c.type + '[' + n + ']'
                });
              });
            }
          }
        });
      }
      if (scanPaths) {
        $paths.forEach((l, n) => {
          if (l.uniqueDigits ?? pathDefaults(l.type ?? 'CUSTOM').uniqueDigits) {
            if (l.positions.some((p) => p.row === cell.row && p.column === cell.column)) {
              l.positions.forEach((p) => {
                if (p.row === cell.row && p.column === cell.column) return;

                seen.push({
                  row: p.row,
                  column: p.column,
                  context: 'PATH:' + l.type + '[' + n + ']'
                });
              });
            }
          }
        });
      }
      if (scanExtraRegions) {
        $regions.forEach((r, n) => {
          if (
            (r.type ?? 'CUSTOM') !== 'Normal' &&
            (r.uniqueDigits ?? regionDefaults(r.type, nonstandard).uniqueDigits)
          ) {
            if (r.positions.some((p) => p.row === cell.row && p.column === cell.column)) {
              r.positions.forEach((p) => {
                if (p.row === cell.row && p.column === cell.column) return;

                seen.push({
                  row: p.row,
                  column: p.column,
                  context: 'REGION:' + r.type + '[' + n + ']'
                });
              });
            }
          }
        });
      }
    }

    return seen;
  }

  function getTuples(
    cell: Position,
    seen = true
  ): { tuple: string; context: string; cells: Position[] }[] {
    if (!seen && $centermarks[cell.row][cell.column] === '') return [];

    let tuples: { tuple: string; context: string; cells: Position[] }[] = [];
    let seenCells = getSeenCells(cell);
    let context = '';

    seenCells.forEach((s) => {
      if (s.context !== context) {
        context = s.context;
        const contextCells = seenCells.filter(
          (c) => c.context === context && $centermarks[c.row][c.column] !== ''
        );

        if (contextCells.length) {
          if (!seen) {
            contextCells.unshift({ ...cell, context });
          }
          contextCells.sort((a, b) => {
            const atuple = $centermarks[a.row][a.column];
            const btuple = $centermarks[b.row][b.column];

            if (atuple.length > btuple.length) return seen ? -1 : 1;
            else if (atuple.length < btuple.length) return seen ? 1 : -1;
            else return 0;
          });

          const skipIndexes: number[] = [];
          for (let i = 0; i < contextCells.length; ++i) {
            let c = contextCells[i];
            let tuple = $centermarks[c.row][c.column];
            let cells = [c];
            for (let j = seen ? i + 1 : 0; j < contextCells.length; ++j) {
              if (j == i || (seen && skipIndexes.indexOf(j) != -1)) continue;

              let d = contextCells[j];
              if ($centermarks[d.row][d.column].split('').every((v) => tuple.indexOf(v) != -1)) {
                cells.push(d);

                skipIndexes.push(j);
              }
            }
            if (cells.length >= tuple.length) {
              if (seen || cells.some((c) => c.row === cell.row && c.column === cell.column)) {
                tuples.push({ tuple, context, cells });

                if (!seen) break;
              }
            }
          }
        }
      } else {
        return;
      }
    });

    return tuples;
  }

  function getCornerSets(cell: Position, seen = true): { digit: string; cells: Position[] }[] {
    let sets: { digit: string; cells: Position[] }[] = [];

    if (seen) {
      let seenCells = getSeenCells(cell);

      seenCells
        .filter((s) => $cornermarks[s.row][s.column] !== '')
        .forEach((c) => {
          let regionCells =
            $regions
              .find(
                (r) =>
                  r.type === 'Normal' &&
                  (r.uniqueDigits ?? true) &&
                  r.positions.some((p) => p.row === c.row && p.column === c.column)
              )
              ?.positions.filter((p) => $cornermarks[p.row][p.column] !== '') ?? [];

          $cornermarks[c.row][c.column].split('').forEach((v) => {
            let valueCells = regionCells.filter(
              (p) => $cornermarks[p.row][p.column].indexOf(v) != -1
            );
            if (
              valueCells.every((q) =>
                seenCells.some((s) => s.row === q.row && s.column === q.column)
              )
            ) {
              sets.push({ digit: v, cells: valueCells });
            }
          });
        });
    } else if ($cornermarks[cell.row][cell.column] !== '') {
      let regionCells =
        $regions
          .find(
            (r) =>
              r.type === 'Normal' &&
              (r.uniqueDigits ?? true) &&
              r.positions.some((p) => p.row === cell.row && p.column === cell.column)
          )
          ?.positions.filter((p) => $cornermarks[p.row][p.column] !== '') ?? [];

      $cornermarks[cell.row][cell.column].split('').forEach((v) => {
        sets.push({
          digit: v,
          cells: regionCells.filter((p) => $cornermarks[p.row][p.column].indexOf(v) != -1)
        });
      });
    }

    return sets;
  }

  function updateHighlightedCells(): void {
    if (highlightMode == 'None') return;

    let cellsToHighlight: Position[] = [];
    if ($selectedCells) {
      $selectedCells.forEach((c) => {
        if (highlightMode == 'Seen') {
          const cellsToAdd = getSeenCells(c).filter(
            (p) =>
              !$selectedCells.some((q) => q.row === p.row && q.column === p.column) &&
              !cellsToHighlight.some((q) => q.row === p.row && q.column === p.column)
          );
          if (cellsToAdd.length) {
            cellsToHighlight = [...cellsToHighlight, ...cellsToAdd];
          }
        } else if (highlightMode == 'Tuples' && $centermarks[c.row][c.column] !== '') {
          getTuples(c, false).forEach((t) => {
            const cellsToAdd = t.cells.filter(
              (p) =>
                !$selectedCells.some((q) => q.row === p.row && q.column === p.column) &&
                !cellsToHighlight.some((q) => q.row === p.row && q.column === p.column)
            );
            if (cellsToAdd.length) {
              cellsToHighlight = [...cellsToHighlight, ...cellsToAdd];
            }
          });
        }
      });
    }

    $highlightedCells = cellsToHighlight;
  }

  function step(): boolean {
    if (!playing) {
      findCandidates();
    }

    for (let n = 0; n < queue.length; ++n) {
      let cell = queue[n];
      let seenCells = getSeenCells(cell);
      let highlightCells: Position[] = [];
      let candidateValues = candidates[cell.row][cell.column];
      if (candidateValues.length > 1) {
        let newCandidateValues = candidateValues.filter((v) => {
          let found = seenCells.find(
            (s) => $givens[s.row][s.column] === v || $values[s.row][s.column] === v
          );
          if (found) {
            highlightCells.push(found);
            return false;
          }

          return true;
        });

        if (newCandidateValues.length > 1 && useCentreMarks) {
          let tuples = getTuples(cell);
          newCandidateValues = newCandidateValues.filter((v) => {
            let found = tuples.find((t) => t.tuple.indexOf(v) !== -1);
            if (found) {
              highlightCells.push(...found.cells);
              return false;
            }

            return true;
          });
        }

        if (newCandidateValues.length > 1 && !nonstandard && useCornerMarks) {
          let sets = getCornerSets(cell);
          newCandidateValues = newCandidateValues.filter((v) => {
            let found = sets.find((s) => s.digit === v);
            if (found) {
              highlightCells.push(...found.cells);
              return false;
            }

            return true;
          });
        }

        if (newCandidateValues.length > 1 && mode === 'Extreme') {
        }

        if (newCandidateValues.length === candidateValues.length) continue;

        candidates[cell.row][cell.column] = candidateValues = newCandidateValues;
      }

      let value: string = '';
      let center: string = $centermarks[cell.row][cell.column];
      let corner: string = $cornermarks[cell.row][cell.column];

      if (candidateValues.length === 1) {
        value = candidateValues[0];
        center = '';
        corner = '';

        queue.splice(n, 1);
      } else {
        if (center !== '') {
          center = candidateValues.join('');
        }
        if (corner !== '') {
          corner = corner
            .split('')
            .filter((u) => candidateValues.some((v) => v === u))
            .join('');
        }
      }

      if (
        value !== $values[cell.row][cell.column] ||
        center !== $centermarks[cell.row][cell.column] ||
        corner !== $cornermarks[cell.row][cell.column]
      ) {
        const newValues = deepCopy($values);
        const newCentermarks = deepCopy($centermarks);
        const newCornermarks = deepCopy($cornermarks);

        newValues[cell.row][cell.column] = value;
        newCentermarks[cell.row][cell.column] = center;
        newCornermarks[cell.row][cell.column] = corner;

        if (corner !== $cornermarks[cell.row][cell.column]) {
          getCornerSets(cell, false).forEach((s) => {
            if (s.cells.length === 2 && corner.indexOf(s.digit) === -1) {
              s.cells.some((c) => {
                if (c.row !== cell.row || c.column !== cell.column) {
                  candidates[c.row][c.column] = [s.digit];
                  newCentermarks[c.row][c.column] = s.digit;
                  newCornermarks[c.row][c.column] = '';
                  return true;
                }
                return false;
              });
            }
          });
        }

        gameHistory.set({
          values: newValues,
          centermarks: newCentermarks,
          cornermarks: newCornermarks
        });

        if (scannerSpeed !== 'Instant') {
          $selectedCells = [cell];
          $highlightedCells = highlightCells;
        }

        return true;
      }
    }

    return false;
  }

  function fullScan(): void {
    if ((playing = step())) {
      nextStep();
    }
  }

  function nextStep(): void {
    let delay: number = 0;
    switch (scannerSpeed) {
      case 'Instant':
        delay = 0;
        break;
      case 'Fast':
        delay = 500;
        break;
      case 'Slow':
        delay = 1000;
        break;
    }
    setTimeout(() => {
      if (playing) {
        if (!step()) {
          playing = false;
        } else {
          nextStep();
        }
      }
    }, delay);
  }

  onMount(() => {
    $handleMouseDown = ({ cell, metaButtonClicked }) => {
      defaultHandleMouseDown({ cell, metaButtonClicked });

      updateHighlightedCells();
    };
    $handleMouseEnter = ({ cell, metaButtonClicked, mouseDown }) => {
      defaultHandleMouseEnter({ cell, metaButtonClicked, mouseDown });

      updateHighlightedCells();
    };
    $handleArrows = ({ k, metaButtonClicked }) => {
      defaultHandleArrows({ k, metaButtonClicked });

      updateHighlightedCells();
    };

    init();

    updateHighlightedCells();
  });
</script>

<div class="grid grid-cols-1 w-full h-full p-2">
  <div class="px-2 flex flex-col overflow-hidden justify-between">
    <div>
      <Label id="highlight">Highlighting</Label>
      <RadioGroup
        options={{
          None: 'None',
          Seen: 'Seen',
          Tuples: 'Tuples'
        }}
        bind:value={highlightMode}
        onChange={() => updateSettings()}
      />
    </div>
    <div>
      <Label id="mode">Scanning</Label>
      <RadioGroup
        options={{
          Basic: 'Basic',
          Advanced: 'Advanced',
          Extreme: 'Extreme'
        }}
        bind:value={mode}
        onChange={() => updateSettings()}
      />
    </div>

    <div
      class="bg-gray-200 rounded-md shadow-inner flex flex-col items-center p-2 overflow-hidden h-full"
    >
      <div class="h-full overflow-y-auto w-full">
        <div>
          <Checkbox
            bind:checked={useCentreMarks}
            label="Use Centre Marks"
            on:change={() => {
              useCentreMarks = !useCentreMarks;
              updateSettings();
            }}
          />
        </div>
        <div>
          <Checkbox
            bind:checked={useCornerMarks}
            label="Use Corner Marks"
            on:change={() => {
              useCornerMarks = !useCornerMarks;
              updateSettings();
            }}
          />
        </div>
        {#if mode !== 'Basic'}
          {#if diagonalPos || diagonalNeg}
            <div>
              <Checkbox
                bind:checked={scanDiagonals}
                label="Scan Diagonals"
                on:change={() => {
                  scanDiagonals = !scanDiagonals;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if antiknight}
            <div>
              <Checkbox
                bind:checked={scanAntiKnight}
                label="Scan Anti-Knight"
                on:change={() => {
                  scanAntiKnight = !scanAntiKnight;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if antiking}
            <div>
              <Checkbox
                bind:checked={scanAntiKing}
                label="Scan Anti-King"
                on:change={() => {
                  scanAntiKing = !scanAntiKing;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if disjointsets}
            <div>
              <Checkbox
                bind:checked={scanDisjointSets}
                label="Scan Disjoint Sets"
                on:change={() => {
                  scanDisjointSets = !scanDisjointSets;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if $cages.some((c) => c.uniqueDigits ?? cageDefaults(c.type ?? 'CUSTOM').uniqueDigits)}
            <div>
              <Checkbox
                bind:checked={scanCages}
                label="Scan Cages"
                on:change={() => {
                  scanCages = !scanCages;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if $paths.some((l) => l.uniqueDigits ?? pathDefaults(l.type ?? 'CUSTOM').uniqueDigits)}
            <div>
              <Checkbox
                bind:checked={scanPaths}
                label="Scan Paths"
                on:change={() => {
                  scanPaths = !scanPaths;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if $regions.some((r) => (r.type ?? 'CUSTOM') !== 'Normal' && (r.uniqueDigits ?? regionDefaults(r.type ?? 'CUSTOM').uniqueDigits))}
            <div>
              <Checkbox
                bind:checked={scanExtraRegions}
                label="Scan Extra Regions"
                on:change={() => {
                  scanExtraRegions = !scanExtraRegions;
                  updateSettings();
                }}
              />
            </div>
          {/if}
        {/if}
        {#if mode === 'Extreme'}
          {#if negativeX || negativeV}
            <div>
              <Checkbox
                bind:checked={scanNegativeXV}
                label="Scan Negative XV"
                on:change={() => {
                  scanNegativeXV = !scanNegativeXV;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if negativeBlack || negativeWhite}
            <div>
              <Checkbox
                bind:checked={scanNegativeKropki}
                label="Scan Negative Kropki"
                on:change={() => {
                  scanNegativeKropki = !scanNegativeKropki;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if nonconsecutive}
            <div>
              <Checkbox
                bind:checked={scanNonConsecutive}
                label="Scan Non-Consecutive"
                on:change={() => {
                  scanNonConsecutive = !scanNonConsecutive;
                  updateSettings();
                }}
              />
            </div>
          {/if}
          {#if entropy}
            <div>
              <Checkbox
                bind:checked={scanEntropy}
                label="Scan Entropy"
                on:change={() => {
                  scanEntropy = !scanEntropy;
                  updateSettings();
                }}
              />
            </div>
          {/if}
        {/if}
      </div>
    </div>
    <div>
      <RadioGroup
        options={{
          Slow: 'Slow',
          Fast: 'Fast',
          Instant: 'Instant'
        }}
        bind:value={scannerSpeed}
        onChange={() => updateSettings()}
      />
    </div>

    <div class="grid grid-cols-3 grid-rows-1 h-max w-max m-auto p-4 gap-4">
      <SquareButton text="Step" disabled={false} on:click={() => step()}>
        <Step />
      </SquareButton>
      <SquareButton
        text="Play"
        disabled={false}
        variant={playing ? 'secondary' : 'default'}
        on:click={() => {
          if (!playing) {
            fullScan();
          } else {
            playing = false;
          }
        }}
      >
        {#if playing}
          <Pause />
        {:else}
          <Play />
        {/if}
      </SquareButton>
      <SquareButton
        text="Auto"
        disabled={false}
        variant={autoScan ? 'secondary' : 'default'}
        on:click={() => {
          autoScan = !autoScan;
          updateSettings();
          if (autoScan && !playing) {
            fullScan();
          }
        }}
      >
        <AutoScan />
      </SquareButton>
    </div>
  </div>
</div>
