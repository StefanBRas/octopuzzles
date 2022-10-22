import { WalkthroughStepValidator, WalkthroughValidator } from '$models/Walkthrough';
import * as trpc from '@trpc/server';
import { TRPCError } from '@trpc/server';
import { ObjectId } from 'mongodb';
import { z } from 'zod';
import type { TRPCContext } from '.';
import { sudokuCollection, walkthroughCollection } from '../dbSetup';

export default trpc
  .router<TRPCContext>()
  .query('get', {
    input: z.object({
      sudokuId: z.string()
    }),
    resolve: async ({ input }) => {
      const walkthrough = await walkthroughCollection.findOne({
        sudoku_id: new ObjectId(input.sudokuId)
      });

      return walkthrough;
    }
  })
  .mutation('delete', {
    input: z.object({
      sudokuId: z.string()
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      const sudokuId = new ObjectId(input.sudokuId);
      const sudoku = await sudokuCollection.findOne({ _id: sudokuId });

      if (sudoku == null) {
        throw new TRPCError({ message: 'This sudoku does not exist', code: 'BAD_REQUEST' });
      } else if (sudoku.user_id !== ctx.session.data.userId) {
        throw new TRPCError({
          message: 'You can only delete your own walkthroughs',
          code: 'BAD_REQUEST'
        });
      }

      await walkthroughCollection.deleteOne({
        sudoku_id: sudokuId,
        user_id: ctx.session.data.userId
      });
    }
  })
  .mutation('createOrUpdate', {
    input: WalkthroughValidator.pick({ sudoku_id: true, steps: true }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      const sudoku = await sudokuCollection.findOne({ _id: input.sudoku_id });

      if (sudoku == null) {
        throw new TRPCError({ message: 'This sudoku does not exist', code: 'BAD_REQUEST' });
      } else if (sudoku.user_id !== ctx.session.data.userId) {
        throw new TRPCError({
          message: 'At the moment, only the creators of sudokus are allowed to make walkthroughs',
          code: 'UNAUTHORIZED'
        });
      }

      const walkthrough = await walkthroughCollection.findOne({
        sudoku_id: input.sudoku_id,
        user_id: ctx.session.data.userId
      });

      if (walkthrough != null) {
        await walkthroughCollection.updateOne(
          {
            sudoku_id: input.sudoku_id,
            user_id: ctx.session.data.userId
          },
          { $set: { steps: input.steps } }
        );
      } else {
        await walkthroughCollection.insertOne({
          sudoku_id: input.sudoku_id,
          user_id: ctx.session.data.userId,
          steps: input.steps
        });
      }
    }
  });
