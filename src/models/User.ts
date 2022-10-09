export type Role = 'Admin' | 'User';

export type User = {
  /** Username of the user */
  username: string;
  /** The email of the user */
  email: string;
  password: string;
  /** The users permission role */
  role: Role;
  /** Whether the user has verified their account */
  verified: boolean;
  /** The time when the user was created */
  created_at: Date;
  /** The last time the user was updated */
  updated_at: Date;
};
