import { mongoClient, sudokuCollection, voteCollection } from '../dbSetup';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import * as trpc from '@trpc/server';
import type { TRPCContext } from '.';
import { ObjectId } from 'mongodb';
import { intervalToDuration } from 'date-fns';
import { rankingAlgorithm } from '$utils/rankingAlgorithm';
import type { Vote } from '$models/Vote';

export default trpc.router<TRPCContext>().mutation('vote', {
  input: z.object({
    sudokuId: z.instanceof(ObjectId),
    value: z.number().int().max(1).min(-1)
  }),
  resolve: async ({ input, ctx }): Promise<Vote | undefined> => {
    // This can, abd should be massively simplified, but maybe the vote architecture should be re-throught anyways
    const userId = ctx.session.data.userId;

    const [sudoku, oldVote] = await Promise.all([
      sudokuCollection.findOne({ _id: input.sudokuId }),
      voteCollection.findOne({ sudoku_id: input.sudokuId, user_id: userId })
    ]);

    if (sudoku == null) {
      throw new TRPCError({
        message: 'We could not find the sudoku you are voting on',
        code: 'BAD_REQUEST'
      });
    }

    const publicSince = sudoku.public_since;
    if (publicSince == null) {
      throw new TRPCError({
        message: "You can't vote on a sudoku that is not published yet",
        code: 'BAD_REQUEST'
      });
    }

    const durationSinceItWentPublic = intervalToDuration({
      start: publicSince,
      end: new Date()
    });
    if (durationSinceItWentPublic.days == null || durationSinceItWentPublic.days > 100) {
      throw new TRPCError({
        message: 'This sudoku has been archived. You cannot vote on it anymore',
        code: 'BAD_REQUEST'
      });
    }

    if (oldVote == null) {
      // The user has not voted before
      if (input.value === 0) {
        // If voting 0 and there is no vote already, do nothing
        return;
      }

      const session = mongoClient.startSession();
      try {
        session.startTransaction();

        const newPoints = sudoku.points + input.value;
        await Promise.all([
          voteCollection.insertOne(
            { sudoku_id: input.sudokuId, user_id: userId, value: input.value },
            { session }
          ),
          sudokuCollection.updateOne(
            { _id: input.sudokuId },
            { $set: { points: newPoints, rank: rankingAlgorithm(newPoints, publicSince) } },
            { session }
          )
        ]);

        await session.commitTransaction();

        return { sudoku_id: input.sudokuId, user_id: userId, value: input.value };
      } catch (e) {
        throw new TRPCError({ message: e.message, code: 'INTERNAL_SERVER_ERROR' });
      }
    } else {
      // The user has voted before
      if (input.value === 0) {
        // delete the vote
        const session = mongoClient.startSession();
        try {
          session.startTransaction();

          const newPoints = sudoku.points - oldVote.value;
          await Promise.all([
            voteCollection.deleteOne(
              { sudoku_id: input.sudokuId, user_id: userId, value: input.value },
              { session }
            ),
            sudokuCollection.updateOne(
              { _id: input.sudokuId },
              { $set: { points: newPoints, rank: rankingAlgorithm(newPoints, publicSince) } },
              { session }
            )
          ]);

          await session.commitTransaction();

          return { sudoku_id: input.sudokuId, user_id: userId, value: input.value };
        } catch (e) {
          throw new TRPCError({ message: e.message, code: 'INTERNAL_SERVER_ERROR' });
        }
      } else if (input.value === oldVote.value) {
        // The user is voting the same that they did before, don't do anything
        return;
      } else {
        // The user is changing their vote
        const session = mongoClient.startSession();
        try {
          session.startTransaction();

          const newPoints = sudoku.points + input.value - oldVote.value;
          await Promise.all([
            voteCollection.updateOne(
              { sudoku_id: input.sudokuId, user_id: userId, value: input.value },
              { $set: { value: input.value } },
              { session }
            ),
            sudokuCollection.updateOne(
              { _id: input.sudokuId },
              { $set: { points: newPoints, rank: rankingAlgorithm(newPoints, publicSince) } },
              { session }
            )
          ]);

          await session.commitTransaction();

          return { sudoku_id: input.sudokuId, user_id: userId, value: input.value };
        } catch (e) {
          throw new TRPCError({ message: e.message, code: 'INTERNAL_SERVER_ERROR' });
        }
      }
    }
  }
});
