import trpc from '$lib/client/trpc';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, url }) => {
  const sudokuId = url.searchParams.get('id');
  const trpcClient = trpc(fetch);
  const [sudoku, walkthrough] =
    sudokuId != null
      ? await Promise.all([
          trpcClient.query('sudokus:get', { id: sudokuId }),
          trpcClient.query('walkthrougs:get', { sudokuId })
        ])
      : [null, null];
  const labels = await trpcClient.query('labels:getAll');
  return { sudoku, labels, walkthrough };
};
