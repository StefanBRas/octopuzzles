import { z } from 'zod';

export const RoleValidator = z.enum(['Admin', 'User']);
export type Role = z.infer<typeof RoleValidator>;

export const UserValidator = z.object({
  /** Username of the user */
  username: z
    .string()
    .max(32, 'Username is too long, it should be at most 32 characters long')
    .min(1, "Username can't be empty")
    .regex(
      /^[a-zA-Z0-9]+(?:-[a-zA-Z0-9]+)*$/,
      'Username may only contain alphanumeric characters or single hyphens, and cannot begin or end with a hyphen'
    ),
  /** The email of the user */
  email: z.string().email(),
  password: z.string().min(10).max(64),
  /** The users permission role */
  role: RoleValidator,
  /** Whether the user has verified their account */
  verified: z.boolean(),
  /** The time when the user was created */
  created_at: z.date(),
  /** The last time the user was updated */
  updated_at: z.date()
});
export type User = z.infer<typeof UserValidator>;
