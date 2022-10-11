<script context="module" lang="ts">
  export function WalkthroughVariables({ props }: LoadInput): Walkthrough$input {
    return {
      sudokuId: props.sudokuId
    };
  }
</script>

<script lang="ts">
  import { graphql, query } from '$houdini';
  import type { Walkthrough, Walkthrough$input } from '$houdini';
  import type { LoadInput } from '@sveltejs/kit';
  import { walkthroughStore } from '$stores/walkthroughStore';

  export let sudokuId: string;

  const {
    data: walkthroughData,
    loading,
    error
  } = query<Walkthrough>(graphql`
    query Walkthrough($sudokuId: ObjectId!) {
      walkthroughOnSudoku(sudokuId: $sudokuId) {
        id
        steps {
          description
          step {
            values
            cornermarks
            centermarks
            notes
            colors
          }
        }
      }
    }
  `);

  $: if ($walkthroughData?.walkthroughOnSudoku?.steps) {
    // Just so ts will shut up
    sudokuId;
    fillWalkthroughStore();
  } else {
    walkthroughStore.set([]);
  }

  function fillWalkthroughStore(): void {
    if ($walkthroughData?.walkthroughOnSudoku?.steps && $walkthroughStore.length === 0) {
      walkthroughStore.set($walkthroughData?.walkthroughOnSudoku?.steps);
    }
  }
</script>

<slot walkthrough={$walkthroughData} loading={$loading} error={$error} />
