import trpc from '$lib/client/trpc';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch }) => {
  try {
    const fetchTrpc = trpc(fetch);
    const labels = await fetchTrpc.query('labels:getAll');
    const sudokus = await fetchTrpc.query('sudokus:getAll');
    return { labels, sudokus };
  } catch (e) {
    console.log(e);

    throw error(404, 'Not found');
  }
};
