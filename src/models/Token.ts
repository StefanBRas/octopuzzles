import type { ObjectId } from 'mongodb';

export type Token = {
  kind: 'VERIFY_EMAIL';
  user_id: ObjectId;
  token: string;
};
