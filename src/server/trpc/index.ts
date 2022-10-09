import type { inferAsyncReturnType } from '@trpc/server';
import * as trpc from '@trpc/server';
import trpcTransformer from 'trpc-transformer';
import labels from './labels';
import sudokus from './sudokus';

export const createContext = async () => ({});

export const router = trpc
  .router<inferAsyncReturnType<typeof createContext>>()
  .transformer(trpcTransformer)
  .merge('labels:', labels)
  .merge('sudokus:', sudokus);

export type Router = typeof router;
