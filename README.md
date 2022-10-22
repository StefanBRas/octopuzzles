# OctoPuzzles.com

Welcome to the open source octopuzzles repo.

## Getting started

First of all, you should copy the `.env.example` file to a `.env` file. The default values should be fine for getting up and running.

We use mongoDB as database. To be able to run transaction when running locally, we need a replica set, so the next thing you should do is run (You need docker for this)

```
docker run -d -p 27017:27017 -p 27018:27018 -p 27019:27019 candis/mongo-replica-set
```

This might take a while to start.

Alternatively, you could also setup your own mongoDB atlas instance.

After that is done, you can now start the website locally by running

```
npm run dev
```

If you want some seed data in your db for local development, you should run

```
npm run seed:db
```

This requires the mongoDB replica set docker container to be up and running.

## Architecture

Below is a list of our stack, and why we have chosen them

- Sveltekit
  - We use svelte since we have a lot of dom updates, and react would be quite cumbersome to make work for this. Other frameworks could be used as well, but we also make heavy use of svelte stores.
- MongoDB
  - We use mongoDB since we have a lot of nested structure. A relational database like postgres would be somewhat cumbersome to use for this. We might consider other databases in the future.
- trpc
  - We use trpc for end to end type safety. It is primarily designed for next, but we use the sveltekit wrapper for this site. It does not have build-in query hooks with something like tanstack query, but might in the future.

## Migrations

Though migrations is not directly a thing in MongoDB, we can still do migrations against the DB with tools like [this](https://www.npmjs.com/package/migrate-mongo).

To make a new migration run

```
npm run migrate:create name_of_migration
```

Then fill out the migration script, and to run it, run

```
npm run migrate:up
```
