import type { RequestEvent } from '@sveltejs/kit';
import type { inferAsyncReturnType } from '@trpc/server';
import * as trpc from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import labels from './labels';
import sudokus from './sudokus';
import users from './users';
import walkthroughs from './walkthroughs';
import votes from './votes';

export const createContext = async (event: RequestEvent) => {
  return { event };
};

export type TRPCContext = inferAsyncReturnType<typeof createContext>;

export const router = trpc
  .router<TRPCContext>()
  .transformer(trpcTransformer)
  .merge('labels:', labels)
  .merge('users:', users)
  .merge('votes:', votes)
  .merge('walkthrougs:', walkthroughs)
  .merge('sudokus:', sudokus);

export type Router = typeof router;
