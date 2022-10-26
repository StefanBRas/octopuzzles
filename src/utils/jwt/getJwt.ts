import jwt from 'jsonwebtoken';
import type { Role } from '$models/User';
import type { RequestEvent } from '@sveltejs/kit';
import { ObjectId } from 'mongodb';

export function getJwt(ctx: { event: RequestEvent<Partial<Record<string, string>>> }) {
  const token = ctx.event.cookies.get('token');

  if (!token) {
    return null;
  }

  const decodedToken = jwt.decode(token.replace('Bearer ', '')) as {
    _id: string;
    role: Role;
  } | null;
  const jwtToken =
    decodedToken != null ? { ...decodedToken, _id: new ObjectId(decodedToken._id) } : null;

  return jwtToken;
}
