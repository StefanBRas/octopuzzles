import { ObjectId } from 'mongodb';
import { z } from 'zod';

export const TokenValidator = z.object({
  kind: z.enum(['VERIFY_EMAIL']),
  user_id: z.instanceof(ObjectId),
  token: z.string()
});

export type Token = z.infer<typeof TokenValidator>;
