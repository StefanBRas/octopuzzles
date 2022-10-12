import { labelCollection } from '../dbSetup';
import * as trpc from '@trpc/server';
import type { TRPCContext } from '.';

export default trpc.router<TRPCContext>().query('getAll', {
  resolve: async () => {
    const labels = await labelCollection.find({}).toArray();

    return labels;
  }
});
