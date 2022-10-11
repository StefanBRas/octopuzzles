import { userCollection } from '../dbSetup';
import * as trpc from '@trpc/server';
import { z } from 'zod';

export default trpc.router().query('login', {
  input: z.object({
    username_or_email: z.string(),
    password: z.string()
  }),
  resolve: async ({ input }) => {
    const user = await userCollection
      .find({
        email: input.username_or_email.includes('@') ? input.username_or_email : undefined,
        username: !input.username_or_email.includes('@') ? input.username_or_email : undefined
      })
      .toArray();

    return labels;
  }
});
