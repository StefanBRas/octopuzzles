import { tokenCollection, userCollection } from '../dbSetup';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import * as argon2 from 'argon2';
import * as trpc from '@trpc/server';
import type { TRPCContext } from '.';
import { ObjectId, type Filter } from 'mongodb';
import { sendVerifyUserMail } from '$server/email';
import pick from 'lodash/pick';
import type { User } from '$models/User';

export default trpc
  .router<TRPCContext>()
  .mutation('register', {
    input: z.object({
      username: z
        .string()
        .max(32, 'Username is too long, it should be at most 32 characters long')
        .min(1, "Username can't be empty")
        .regex(
          /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
          'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen'
        ),
      email: z.string().email(),
      password: z.string().min(10).max(64)
    }),
    resolve: async ({ input }) => {
      const hashedPassword = await argon2.hash(input.password);

      try {
        const user = await userCollection.insertOne({
          created_at: new Date(),
          updated_at: new Date(),
          email: input.email,
          password: hashedPassword,
          role: 'User',
          username: input.username,
          verified: false
        });

        const token = ObjectId.generate().toString();

        sendVerifyUserMail(input.username, input.email, token);

        tokenCollection.insertOne({ kind: 'VERIFY_EMAIL', token: token, user_id: user.insertedId });

        return true;
      } catch (e) {
        console.log(e);

        return false;
      }
    }
  })
  .mutation('login', {
    input: z.object({
      usernameOrEmail: z.string(),
      password: z.string()
    }),
    resolve: async ({ input, ctx }) => {
      const usernameOrEmail = input.usernameOrEmail;
      const filter: Filter<User> = {};
      if (usernameOrEmail.includes('@')) {
        filter.email = usernameOrEmail;
      } else {
        filter.username = usernameOrEmail;
      }
      const user = await userCollection.findOne(filter);

      if (user == null) {
        throw new TRPCError({
          message: 'That username or email does not exist',
          code: 'BAD_REQUEST'
        });
      }

      const passwordIsValid = await argon2.verify(
        user.password,
        input.password /* {
        salt: Buffer.from(ARGON2_SALT)
      } */
      );
      if (!passwordIsValid) {
        throw new TRPCError({
          message: 'Wrong password',
          code: 'BAD_REQUEST'
        });
      }
      if (!user.verified) {
        throw new TRPCError({
          message:
            'Please verify your account. We have send you an email with a verification link.',
          code: 'BAD_REQUEST'
        });
      }

      await ctx.session.set({ userId: user._id, role: user.role });

      return pick(user, ['_id', 'email', 'role', 'username']);
    }
  })
  .mutation('logout', {
    resolve: async ({ ctx }) => {
      await ctx.session.destroy();
    }
  })
  .query('me', {
    resolve: async ({ ctx }) => {
      const session = ctx.session.data;

      if (session) {
        const user = await userCollection.findOne({ _id: session.userId });
        if (user) {
          return pick(user, ['_id', 'email', 'role', 'username']);
        }
      }

      return null;
    }
  });
