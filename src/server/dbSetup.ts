import { MONGODB_URI } from '$env/static/private';
import type { Sudoku } from '$models/Sudoku';
import type { User } from '$models/User';
import type { Vote } from '$models/Vote';
import type { Walkthrough } from '$models/Walkthrough';
import { MongoClient } from 'mongodb';
import type { Label } from '../models/Label';
import type { Token } from '../models/Token';

export const mongoClient = new MongoClient(MONGODB_URI);

export const database = mongoClient.db('octopuzzles');

export const labelCollection = database.collection<Label>('labels');
export const sudokuCollection = database.collection<Sudoku>('sudokus');
export const userCollection = database.collection<User>('users');
export const voteCollection = database.collection<Vote>('votes');
export const walkthroughCollection = database.collection<Walkthrough>('walkthroughs');
export const tokenCollection = database.collection<Token>('tokens');
