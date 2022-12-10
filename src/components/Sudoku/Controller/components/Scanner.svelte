<script lang="ts">
  import SquareButton from '$ui/SquareButton.svelte';
  import Play from '$icons/Play.svelte';
  import Pause from '$icons/Pause.svelte';
  import Step from '$icons/Step.svelte';
  import AutoScan from '$icons/AutoScan.svelte';
  import { editorHistory, gameHistory } from '$stores/sudokuStore';
  import { onMount } from 'svelte';
  import Label from '$ui/Label.svelte';
  import RadioGroup from '$ui/RadioGroup.svelte';
  import Checkbox from '$ui/Checkbox.svelte';
  import { cageDefaults, pathDefaults, regionDefaults } from '$utils/prefabs';
  import { defaultRegionSize } from '$utils/defaults';
  import type { Position } from '$models/Sudoku';
  import type { ScannerSettings } from '$models/User';

  import { me } from '$stores/meStore';

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

  let values = gameHistory.getValue('values');
  let centermarks = gameHistory.getValue('centermarks');
  let cornermarks = gameHistory.getValue('cornermarks');
  let dimensions = editorHistory.getClue('dimensions');
  let cells = editorHistory.getClue('cells');
  let regions = editorHistory.getClue('regions');
  let cages = editorHistory.getClue('cages');
  let paths = editorHistory.getClue('paths');
  let logic = editorHistory.getClue('logic');

  let digits = $logic.digits ?? '1-9';
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

  const rowOffset = $dimensions.margins?.top ?? 0;
  const columnOffset = $dimensions.margins?.left ?? 0;
  const rows = $dimensions.rows - rowOffset - ($dimensions.margins?.bottom ?? 0);
  const columns = $dimensions.columns - columnOffset - ($dimensions.margins?.right ?? 0);
  const { width, height } = defaultRegionSize($dimensions);

  let allDigits: string[] = [];
  let candidates: string[][][] = [];
  let seen: { row: number; column: number; context: string }[][][] = [];

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
  }

  function handleKeyDown(k: KeyboardEvent): void {}

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

    for (let i = 0; i < rows; ++i) {
      candidates[i + rowOffset] = [];
      seen[i + rowOffset] = [];

      for (let j = 0; j < columns; ++j) {
        if ($values[i + rowOffset][j + columnOffset] !== '') continue;

        candidates[i + rowOffset][j + columnOffset] =
          $centermarks[i + rowOffset][j + columnOffset].split('');
        seen[i + rowOffset][j + columnOffset] = [];

        if (!nonstandard) {
          for (let y = 0; y < rows; ++y) {
            if (y !== i)
              seen[i + rowOffset][j + columnOffset].push({
                row: y + rowOffset,
                column: j + columnOffset,
                context: 'ROW'
              });
          }
          for (let x = 0; x < rows; ++x) {
            if (x != j)
              seen[i + rowOffset][j + columnOffset].push({
                row: i + rowOffset,
                column: x + columnOffset,
                context: 'COLUMN'
              });
          }
        }
        if (mode !== 'Basic') {
          if (diagonalNeg && scanDiagonals) {
            if (i === j) {
              for (let k = 0; k < rows; ++k) {
                if (k !== i)
                  seen[i + rowOffset][j + columnOffset].push({
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
                  seen[i + rowOffset][j + columnOffset].push({
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

                seen[i + rowOffset][j + columnOffset].push({
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

                seen[i + rowOffset][j + columnOffset].push({
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
                  seen[i + rowOffset][j + columnOffset].push({
                    row: (i % height) + m * height + rowOffset,
                    column: (j % width) + n * width + columnOffset,
                    context: 'DISJOINTSET'
                  });
                }
              }
            }
          }
        }
      }
    }

    $regions.forEach((r) => {
      if (
        (r.uniqueDigits ?? regionDefaults(r.type, nonstandard).uniqueDigits) &&
        (r.type === 'Normal' || (mode !== 'Basic' && scanExtraRegions))
      ) {
        r.positions.forEach((p) => {
          r.positions.forEach((q) => {
            if (p === q) return;

            seen[p.row][p.column].push({
              row: q.row,
              column: q.column,
              context: 'REGION:' + r.type
            });
          });
        });
      }
    });

    if (mode !== 'Basic') {
      if (scanCages) {
        $cages.forEach((c) => {
          if (c.uniqueDigits ?? cageDefaults(c.type ?? 'CUSTOM').uniqueDigits) {
            c.positions.forEach((p) => {
              c.positions.forEach((q) => {
                if (p === q) return;

                seen[p.row][p.column].push({
                  row: q.row,
                  column: q.column,
                  context: 'CAGE:' + c.type
                });
              });
            });
          }
        });
      }
      if (scanPaths) {
        $paths.forEach((l) => {
          if (l.uniqueDigits ?? pathDefaults(l.type ?? 'CUSTOM').uniqueDigits) {
            l.positions.forEach((p) => {
              l.positions.forEach((q) => {
                if (p === q) return;

                seen[p.row][p.column].push({
                  row: q.row,
                  column: q.column,
                  context: 'PATH:' + l.type
                });
              });
            });
          }
        });
      }
    }
  }

  function step(position?: Position): Position {
    return { row: 1, column: 1 };
  }

  function runScan(): void {
    if (!playing) {
      playing = true;
    }

    //while (playing) {}
  }

  onMount(() => {
    init();
  });
</script>

<svelte:window on:keydown={handleKeyDown} />

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
      <SquareButton text="Step" disabled={false} on:click={() => {}}>
        <Step />
      </SquareButton>
      <SquareButton
        text="Play"
        disabled={false}
        variant={playing ? 'secondary' : 'default'}
        on:click={() => {
          playing = !playing;
          if (playing) {
            runScan();
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
          if (autoScan) {
            runScan();
          }
        }}
      >
        <AutoScan />
      </SquareButton>
    </div>
  </div>
</div>
