import { labelCollection, mongoClient, sudokuCollection, voteCollection } from '../dbSetup';
import * as trpc from '@trpc/server';
import { z } from 'zod';
import { ObjectId, type Filter, type WithId } from 'mongodb';
import {
  NewSudokuValidator,
  SolutionValidator,
  UpdateSudokuValidator,
  type Sudoku
} from '$models/Sudoku';
import type { TRPCContext } from '.';
import type { User } from '$models/User';
import { TRPCError } from '@trpc/server';
import type { Vote } from '$models/Vote';
import type { Label } from '$models/Label';
import {
  validateCorrectDimension,
  validateCorrectDimensionsOfSudokuClues
} from '$utils/validation';

export default trpc
  .router<TRPCContext>()
  .query('search', {
    input: z.object({
      labels: z.array(z.instanceof(ObjectId)),
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.date().nullish(),
      userId: z.instanceof(ObjectId).optional()
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
      if (input.userId != null) {
        filter.user_id = { $eq: input.userId };
      }
      const sudokusAgg = (await sudokuCollection
        .aggregate([
          { $match: filter },
          { $lookup: { from: 'users', localField: 'user_id', foreignField: '_id', as: 'creator' } }
        ])
        .sort({ public_since: -1 })
        .limit(limit + 1)
        .toArray()) as (WithId<Sudoku> & { creator: WithId<User>[] })[];

      const sudokus: (WithId<Sudoku> & { creator?: WithId<User> })[] = sudokusAgg.map((sudoku) => {
        return {
          ...sudoku,
          creator: sudoku.creator[0] ?? undefined
        };
      });

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
      id: z.string() // TODO: make this `z.instanceof(ObjectId)`
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
        const sudokuWithUser:
          | (WithId<Sudoku> & {
              creator?: WithId<User>;
              userVote?: WithId<Vote>;
              fullLabels: WithId<Label>[];
            })
          | null =
          sudokus.length > 0
            ? {
                ...sudokus[0],
                creator: sudokus[0].creator[0],
                userVote: sudokus[0].userVote[0] ?? undefined
              }
            : null;
        return sudokuWithUser;
      }
    }
  })
  .mutation('delete', {
    input: z.object({
      id: z.instanceof(ObjectId)
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      const session = mongoClient.startSession();
      const sudokuId = new ObjectId(input.id);
      try {
        session.startTransaction();

        const sudoku = await sudokuCollection.findOneAndDelete(
          {
            _id: sudokuId,
            user_id: ctx.session.data.userId
          },
          { session }
        );
        if (sudoku.value == null) {
          throw new TRPCError({
            message: 'Something went wrong when deleting your sudoku',
            code: 'INTERNAL_SERVER_ERROR'
          });
        }

        await voteCollection.deleteMany({ sudoku_id: sudoku.value._id }, { session });

        await session.commitTransaction();

        return sudoku.value;
      } catch (e) {
        throw new TRPCError({ message: e.message, code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  })
  .mutation('changePublicStatus', {
    input: z.object({
      id: z.instanceof(ObjectId),
      public: z.boolean()
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      // First check if the user has permission to update the sudoku.
      const sudoku = await sudokuCollection.findOne({ _id: input.id });
      if (sudoku == null) {
        throw new TRPCError({
          message: 'We could not find the sudoku you are trying to update',
          code: 'BAD_REQUEST'
        });
      } else if (sudoku.user_id !== ctx.session.data.userId) {
        throw new TRPCError({
          message: 'You are not allowed to edit this sudoku',
          code: 'UNAUTHORIZED'
        });
      }

      let shouldDeleteVotes = false;
      const newSudoku: Partial<Sudoku> = {
        points: 0,
        rank: 0
      };

      if (input.public && sudoku.public_since == null) {
        // The user wants to make the sudoku public
        newSudoku.public_since = new Date();
      } else if (!input.public && sudoku.public_since != null) {
        // User wants to take the sudoku out of public status
        shouldDeleteVotes = true;
        newSudoku.public_since = undefined;
      } else {
        // The user is not really changing the public status, just return what it already is
        return input.public;
      }

      const session = mongoClient.startSession();
      try {
        session.startTransaction();

        await sudokuCollection.updateOne({ _id: input.id }, { $set: newSudoku }, { session });

        if (shouldDeleteVotes) {
          await voteCollection.deleteMany({ sudoku_id: sudoku._id }, { session });
        }

        await session.commitTransaction();

        return input.public;
      } catch (e) {
        throw new TRPCError({ message: e.message, code: 'INTERNAL_SERVER_ERROR' });
      }
    }
  })
  .mutation('provideSolutionToPuzzle', {
    input: z.object({
      sudokuId: z.instanceof(ObjectId),
      solution: SolutionValidator.optional()
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      // First check if the user has permission to make a solution for the sudoku.
      const sudoku = await sudokuCollection.findOne({ _id: input.sudokuId });
      if (sudoku == null) {
        throw new TRPCError({
          message: 'We could not find the sudoku you are trying to update',
          code: 'BAD_REQUEST'
        });
      } else if (sudoku.user_id == null || sudoku.user_id != ctx.session.data.userId) {
        throw new TRPCError({
          message: 'You are not allowed to provide a solution to this sudoku',
          code: 'BAD_REQUEST'
        });
      }

      if (input.solution == null) {
        // delete solution from sudoku
        const updatedSudoku = await sudokuCollection.findOneAndUpdate(
          { _id: input.sudokuId },
          { $unset: { solution: '' } },
          { returnDocument: 'after' }
        );

        return updatedSudoku.value;
      } else {
        // Add solution to puzzle
        validateCorrectDimension(input.solution.numbers, sudoku.dimensions, 'solution');

        const updatedSudoku = await sudokuCollection.findOneAndUpdate(
          { _id: input.sudokuId },
          { $set: { solution: input.solution } },
          { returnDocument: 'after' }
        );

        return updatedSudoku.value;
      }
    }
  })
  .mutation('create', {
    input: z.object({
      sudoku: NewSudokuValidator
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      validateCorrectDimensionsOfSudokuClues(input.sudoku);

      const sudoku: Sudoku = {
        ...input.sudoku,
        created_at: new Date(),
        updated_at: new Date(),
        user_id: ctx.session.data.userId,
        rank: 0,
        points: 0
      };

      const labels = await labelCollection.countDocuments({ _id: { $in: input.sudoku.labels } });
      if (labels !== input.sudoku.labels.length) {
        throw new TRPCError({
          message: 'One of the specified labels does not exist',
          code: 'BAD_REQUEST'
        });
      }

      const s = await sudokuCollection.insertOne(sudoku);
      const newSudoku = await sudokuCollection.findOne({ _id: s.insertedId });

      return newSudoku;
    }
  })
  .mutation('update', {
    input: z.object({
      id: z.instanceof(ObjectId),
      sudokuUpdates: UpdateSudokuValidator
    }),
    resolve: async ({ input, ctx }) => {
      if (ctx.session.data.userId == null) {
        throw new TRPCError({ message: 'You are not logged in', code: 'UNAUTHORIZED' });
      }
      // First check if the user has permission to update the sudoku.
      const oldSudoku = await sudokuCollection.findOne({ _id: input.id });
      if (oldSudoku == null) {
        throw new TRPCError({
          message: 'We could not find the sudoku you are trying to update',
          code: 'BAD_REQUEST'
        });
      } else if (oldSudoku.user_id == null || oldSudoku.user_id !== ctx.session.data.userId) {
        throw new TRPCError({
          message: 'You are not allowed to edit this sudoku',
          code: 'BAD_REQUEST'
        });
      }
      validateCorrectDimensionsOfSudokuClues({
        ...input.sudokuUpdates,
        dimensions: input.sudokuUpdates.dimensions ?? oldSudoku.dimensions
      });

      if (input.sudokuUpdates.labels != null) {
        const labels = await labelCollection.countDocuments({
          _id: { $in: input.sudokuUpdates.labels }
        });
        if (labels !== input.sudokuUpdates.labels.length) {
          throw new TRPCError({
            message: 'One of the specified labels does not exist',
            code: 'BAD_REQUEST'
          });
        }
      }
      // User has permission to edit the sudoku

      const updatedSudoku = await sudokuCollection.findOneAndUpdate(
        { _id: input.id },
        { $set: input.sudokuUpdates },
        { returnDocument: 'after' }
      );

      return updatedSudoku.value;
    }
  });
