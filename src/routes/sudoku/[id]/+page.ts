import trpc from '$lib/client/trpc';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  const trpcClient = trpc(fetch);
  const sudokuId = params.id;
  const [sudoku, walkthrough] = await Promise.all([
    trpcClient.query('sudokus:get', { id: sudokuId }),
    trpcClient.query('walkthrougs:get', { sudokuId })
  ]);
  return { sudoku, walkthrough };
};
