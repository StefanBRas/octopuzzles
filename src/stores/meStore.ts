import type { Me$result } from '$houdini';
import { writable } from 'svelte/store';

export const me = writable<Me$result['me'] | null>(null);
