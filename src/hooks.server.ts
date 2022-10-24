import { createContext, router } from './server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  // Do anything you want here
  const response = await createTRPCHandle({
    router,
    createContext,
    responseMeta: ({ ctx }) => {
      const token = ctx?.event.cookies.get('token');
      console.log({ token });
      return {
        headers: {
          'set-cookie': `token=${token ?? ''}`
        }
      };
    },
    event,
    resolve
  });

  return response;
};
