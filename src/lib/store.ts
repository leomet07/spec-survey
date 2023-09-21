import { writable } from 'svelte/store';
import type { LatLngSimple } from "$lib/types";

export const q1_results = writable<LatLngSimple | undefined>();

