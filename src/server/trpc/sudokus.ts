import { sudokuCollection } from '../dbSetup';
import * as trpc from '@trpc/server';
import { z } from 'zod';
import { ObjectId, type Filter } from 'mongodb';
import type { Sudoku } from '$models/Sudoku';

export default trpc.router().query('search', {
  input: z.object({
    labels: z.array(z.instanceof(ObjectId)),
    limit: z.number().min(1).max(100).nullish(),
    cursor: z.date().nullish()
  }),
  resolve: async ({ input }) => {
    const limit = input.limit ?? 24;
    const filter: Filter<Sudoku> = { public_since: { $exists: true } };
    if (input.cursor) {
      filter.public_since = { ...filter.public_since, $lt: input.cursor };
    }
    if (input.labels.length > 0) {
      filter.labels = { $in: input.labels };
    }
    const sudokus = await sudokuCollection
      .find(filter)
      .sort({ public_since: -1 })
      .limit(limit + 1)
      .toArray();

    let nextCursor: typeof input.cursor | undefined = undefined;
    if (sudokus.length > limit) {
      const nextItem = sudokus.pop();
      nextCursor = nextItem?.public_since;
    }

    return { sudokus, nextCursor };
  }
});
