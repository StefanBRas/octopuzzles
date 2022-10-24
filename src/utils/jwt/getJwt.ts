import jwt from 'jsonwebtoken';
import type { Role } from '$models/User';
import type { RequestEvent } from '@sveltejs/kit';
import type { ObjectId } from 'mongodb';

export function getJwt(ctx: { event: RequestEvent<Partial<Record<string, string>>> }) {
  const token = ctx.event.cookies.get('token');

  console.log('getJWT', { token });
  if (!token) {
    return null;
  }

  const jwtToken = jwt.decode(token.replace('Bearer ', '')) as {
    _id: ObjectId;
    role: Role;
  } | null;
  console.log('getJWT', { jwtToken });

  return jwtToken;
}
