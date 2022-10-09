import { labelCollection } from '../dbSetup';
import * as trpc from '@trpc/server';

export default trpc.router().query('getAll', {
  resolve: async () => {
    const labels = await labelCollection.find({}).toArray();

    return labels;
  }
});
