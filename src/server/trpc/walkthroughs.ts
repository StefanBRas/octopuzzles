import * as trpc from '@trpc/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { TRPCContext } from '.';
import { walkthroughCollection } from '../dbSetup';

export default trpc.router<TRPCContext>().query('get', {
  input: z.object({
    sudokuId: z.string()
  }),
  resolve: async ({ input }) => {
    const walkthroug = await walkthroughCollection.findOne({
      sudoku_id: new ObjectId(input.sudokuId)
    });

    return walkthroug;
  }
});
