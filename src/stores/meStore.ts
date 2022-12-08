import type { User } from '@prisma/client';
import { writable } from 'svelte/store';

export const me = writable<Pick<User, 'id' | 'email' | 'role' | 'username' | 'settings'> | null>(null);
