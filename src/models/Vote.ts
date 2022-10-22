import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const VoteValidator = z.object({
  /** The id of the user who created the vote */
  user_id: z.instanceof(ObjectId),
  /** The id of the sudoku the user voted on */
  sudoku_id: z.instanceof(ObjectId),
  /** The value of the vote, either of -1 of 1 */
  value: z.number().int().max(1).min(-1)
});
export type Vote = z.infer<typeof VoteValidator>;
