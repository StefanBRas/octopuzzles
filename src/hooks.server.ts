import { createContext, router } from './server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';

export const handle = async ({ event, resolve }) => {
  const response = await createTRPCHandle({
    router,
    createContext,
    event,
    resolve
  });

  return response;
};
