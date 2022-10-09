import type { ObjectId } from 'mongodb';

export type Vote = {
  /** The id of the user who created the vote */
  user_id: ObjectId;
  /** The id of the sudoku the user voted on */
  sudoku_id: ObjectId;
  /** The value of the vote, either of -1 of 1 */
  value: number;
};
