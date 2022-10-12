import type { User } from '$models/User';
import type { WithId } from 'mongodb';
import { writable } from 'svelte/store';

export const me = writable<Pick<WithId<User>, '_id' | 'email' | 'role' | 'username'> | null>(null);
