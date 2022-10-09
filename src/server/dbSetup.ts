import { MONGODB_URI } from '$env/static/private';
import type { Sudoku } from '$models/Sudoku';
import { MongoClient } from 'mongodb';
import type { Label } from '../models/Label';

export const mongoClient = new MongoClient(MONGODB_URI);

export const database = mongoClient.db('octopuzzles');

export const labelCollection = database.collection<Label>('labels');
export const sudokuCollection = database.collection<Sudoku>('sudokus');
