import trpc from '$lib/client/trpc';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  const trpcClient = trpc(fetch);
  const [labels, sudokuData] = await Promise.all([
    trpcClient.query('labels:getAll'),
    trpcClient.query('sudokus:search', { limit: 24, labels: [] })
  ]);
  return { labels, sudokuData };
};
