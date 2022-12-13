<script lang="ts">
  import SquareButton from '$ui/SquareButton.svelte';
  import Play from '$icons/Play.svelte';
  import Pause from '$icons/Pause.svelte';
  import Step from '$icons/Step.svelte';
  import AutoScan from '$icons/AutoScan.svelte';
  import { editorHistory } from '$stores/sudokuStore';
  import Label from '$ui/Label.svelte';
  import RadioGroup from '$ui/RadioGroup.svelte';
  import Checkbox from '$ui/Checkbox.svelte';
  import { cageDefaults, pathDefaults, regionDefaults } from '$utils/prefabs';
  import type { ScannerSettings } from '$models/User';

  import { me } from '$stores/meStore';
  import { scanner } from '$stores/sudokuStore/scanner';

  let scannerSettings: ScannerSettings = me.getSettings().scanner ?? {};
  let highlightMode = scannerSettings.highlightMode ?? 'None';
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

  let regions = editorHistory.getClue('regions');
  let cages = editorHistory.getClue('cages');
  let paths = editorHistory.getClue('paths');
  let logic = editorHistory.getClue('logic');

  let flags = $logic.flags ?? [];
  let diagonalPos = flags.indexOf('DiagonalPos') !== -1;
  let diagonalNeg = flags.indexOf('DiagonalNeg') !== -1;
  let antiknight = flags.indexOf('Antiknight') !== -1;
  let antiking = flags.indexOf('Antiking') !== -1;
  let disjointsets = flags.indexOf('DisjointSets') !== -1;
  let nonconsecutive = flags.indexOf('Nonconsecutive') !== -1;
  let entropy = flags.indexOf('Entropy') !== -1;
  let negativeX = flags.indexOf('NegativeX') !== -1;
  let negativeV = flags.indexOf('NegativeV') !== -1;
  let negativeBlack = flags.indexOf('NegativeBlack') !== -1;
  let negativeWhite = flags.indexOf('NegativeWhite') !== -1;

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

    scanner.configure(scannerSettings);
  }
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
      <SquareButton text="Step" disabled={false} on:click={() => scanner.step()}>
        <Step />
      </SquareButton>
      <SquareButton
        text="Play"
        disabled={false}
        variant={scanner.isScanning() ? 'secondary' : 'default'}
        on:click={() => {
          if (!scanner.isScanning()) {
            scanner.startScan();
          } else {
            scanner.stopScan();
          }
        }}
      >
        {#if scanner.isScanning()}
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
          if (autoScan && !scanner.isScanning) {
            scanner.startScan();
          }
        }}
      >
        <AutoScan />
      </SquareButton>
    </div>
  </div>
</div>
