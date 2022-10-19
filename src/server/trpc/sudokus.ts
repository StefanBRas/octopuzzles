import { sudokuCollection } from '../dbSetup';
import * as trpc from '@trpc/server';
import { z } from 'zod';
import { ObjectId, type Filter, type WithId } from 'mongodb';
import type { Sudoku } from '$models/Sudoku';
import type { TRPCContext } from '.';
import type { User } from '$models/User';
import { TRPCError } from '@trpc/server';
import type { Vote } from '$models/Vote';
import type { Label } from '$models/Label';

export default trpc
  .router<TRPCContext>()
  .query('search', {
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
      const sudokusAgg = (await sudokuCollection
        .aggregate([
          { $match: filter },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'creator' } }
        ])
        .sort({ public_since: -1 })
        .limit(limit + 1)
        .toArray()) as (WithId<Sudoku> & { creator: WithId<User>[] })[];

      const sudokus: (WithId<Sudoku> & { creator: WithId<User> | undefined })[] = sudokusAgg.map(
        (sudoku) => {
          return {
            ...sudoku,
            creator: sudoku.creator[0] ?? undefined
          };
        }
      );

      let nextCursor: typeof input.cursor | undefined = undefined;
      if (sudokus.length > limit) {
        const nextItem = sudokus.pop();
        nextCursor = nextItem?.public_since;
      }

      return { sudokus, nextCursor };
    }
  })
  .query('get', {
    input: z.object({
      id: z.string()
    }),
    resolve: async ({ input, ctx }) => {
      const userId = ctx.session.data.userId;
      const sudokus = (await sudokuCollection
        .aggregate([
          { $match: { _id: input.id } },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'creator' } },
          {
            $lookup: {
              from: 'votes',
              // localField: '_id',
              // foreignField: 'sudoku_id',
              as: 'userVote',
              pipeline: [{ $match: { user_id: userId } }]
            }
          },
          {
            $lookup: {
              from: 'labels',
              localField: 'labels',
              foreignField: '_id',
              as: 'fullLabels'
            }
          }
        ])
        .limit(1)
        .toArray()) as (WithId<Sudoku> & {
        creator: WithId<User>[];
        userVote: WithId<Vote>[];
        fullLabels: WithId<Label>[];
      })[];
      if (sudokus.length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      } else {
        const sudokuWithUser: WithId<Sudoku> & {
          creator?: WithId<User>;
          userVote?: WithId<Vote>;
          fullLabels: WithId<Label>[];
        } = {
          ...sudokus[0],
          creator: sudokus[0].creator[0],
          userVote: sudokus[0].userVote[0] ?? undefined
        };
        return sudokuWithUser;
      }
    }
  });
