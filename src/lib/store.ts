import { writable } from 'svelte/store';
import type { QuestionResults } from "$lib/types";

export const q1_results = writable<QuestionResults | undefined>();