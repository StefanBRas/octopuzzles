import { createContext, router } from './server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';
import { handleSession } from 'svelte-kit-cookie-session';

export const handle = handleSession(
  {
    secret: 'SOME_COMPLEX_SECRET_AT_LEAST_32_CHARS'
  },
  async ({ event, resolve }) => {
    // event.locals is populated with the session `event.locals.session`

    // Do anything you want here
    const response = await createTRPCHandle({
      router,
      createContext,
      event,
      resolve
    });

    return response;
  }
);
