import trpc from '$lib/client/trpc';
import { error } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
  console.log('Here');
  const trpcClient = trpc(fetch);
  const sudokuId = params.id;
  const [sudoku, walkthrough] = await Promise.all([
    trpcClient.query('sudokus:get', { id: sudokuId }),
    trpcClient.query('walkthrougs:get', { sudokuId })
  ]);
  console.log({ walkthrough, sudoku });
  if (sudoku == null) {
    throw error(404, 'Not found');
  }
  return { sudoku, walkthrough };
};
