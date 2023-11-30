import { writable } from "svelte/store";
import type { QuestionResults, EthnicityQuestionResults } from "$lib/types";

export const q1_results = writable<QuestionResults | undefined>();
export const q2_results = writable<QuestionResults | undefined>();
export const q3_results = writable<QuestionResults | undefined>();
export const q4_results = writable<QuestionResults | undefined>();
export const q5_results = writable<QuestionResults | undefined>();
export const q6_results = writable<QuestionResults | undefined>();
export const q7_results = writable<QuestionResults | undefined>();
export const ethnicity_results = writable<
	EthnicityQuestionResults | undefined
>();