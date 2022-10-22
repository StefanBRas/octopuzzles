import { createContext, router } from './server/trpc';
import { createTRPCHandle } from 'trpc-sveltekit';
import { handleSession } from 'svelte-kit-cookie-session';
import { SESSION_SECRET } from '$env/static/private';

export const handle = handleSession(
  {
    secret: SESSION_SECRET
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
