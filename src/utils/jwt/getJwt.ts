import jwt from 'jsonwebtoken';
import type { Role } from '$models/User';
import type { RequestEvent } from '@sveltejs/kit';

export function getJwt(ctx: { event: RequestEvent<Partial<Record<string, string>>> }) {
  const token = ctx.event.cookies.get('token');

  if (!token) {
    return null;
  }

  const decodedToken = jwt.decode(token.replace('Bearer ', '')) as {
    id: number;
    role: Role;
  } | null;

  return decodedToken;
}
