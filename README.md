# OctoPuzzles.com

Welcome to the open source octopuzzles repo.

## Getting started

First of all, you should copy the `.env.example` file to a `.env` file. The default values should be fine for getting up and running.

We use postgres as database. To start a local database, you can use the docker compose. Just run

```
docker compose up -d
```

This might take a while to start.

After that is done, you can now start the website locally by running

```
npm run dev
```

## Architecture

Below is a list of our stack, and why we have chosen them

- Sveltekit
  - We use svelte since we have a lot of dom updates, and react would be quite cumbersome to make work for this. Other frameworks could be used as well, but we also make heavy use of svelte stores.
- trpc
  - We use trpc for end to end type safety. It is primarily designed for next, but we use the sveltekit wrapper for this site. It does not have build-in query hooks with something like tanstack query, but might in the future.
