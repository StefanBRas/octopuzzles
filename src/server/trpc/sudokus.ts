import { sudokuCollection } from '../dbSetup';
import * as trpc from '@trpc/server';

export default trpc.router().query('getAll', {
  resolve: async () => {
    const sudokus = await sudokuCollection.find({}).limit(10).toArray();

    return sudokus;
  }
});
