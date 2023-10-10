<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";
	import * as store from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";
	import { ClientResponseError, type RecordModel } from "pocketbase";
	import type { QuestionResults } from "$lib/types";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;

	async function questionUpdater(
		questionStore: QuestionResults | undefined,
		question_id: string
	) {
		if (!$currentUser || !questionStore) {
			return;
		}

		const matched_to_on_load = found_answers?.filter(
			(v: any) => v.question_id == question_id
		);

		if (
			matched_to_on_load.length > 0 &&
			matched_to_on_load[0]?.lat == questionStore.latlng.lat &&
			matched_to_on_load[0]?.lng == questionStore.latlng.lng
		) {
			console.log("Returning early, this is from the initial on load");
			// nothing has changed from the initial markers from db, do not do any db stuff
			return;
		}

		let found;
		try {
			found = await pb
				.collection("questions")
				.getFirstListItem(`question_id="${question_id}"`);
		} catch (e: any) {
			if (e.status != 404 && !(e instanceof ClientResponseError)) {
				// if 404, just return false
				throw e;
			}
		}

		const data = {
			lat: questionStore.latlng.lat,
			lng: questionStore.latlng.lng,
			political_address_components:
				questionStore.political_address_components,
			parent_user: $currentUser.id,
			question_id: question_id,
		};

		if (found) {
			if (found.lat == data.lat && found.lng == data.lng) {
				// nothing has changed, do not do any db stuff
				return;
			}
			const deleted = await pb.collection("questions").delete(found.id);
		}
		const created = await pb.collection("questions").create(data);
	}

	const question_mapping = {
		q1_results: "A",
		q2_results: "B",
		q3_results: "C",
		q4_results: "D",
		q5_results: "E",
		q6_results: "F",
		q7_results: "G",
	};

	type question_keys = keyof typeof question_mapping;
	async function listen_for_updates() {
		for (const key in question_mapping) {
			store[key as question_keys].subscribe(async (q) => {
				questionUpdater(q, question_mapping[key as question_keys]);
			});
		}
	}

	currentUser.subscribe(async (curr_user) => {
		if (curr_user?.id) {
			load_questions();
		}
	});

	let found_answers: any | undefined;

	async function load_questions() {
		found_answers = await pb
			.collection("questions")
			.getFullList({ requestKey: "load_questions" });
		console.log("Found answers: ", found_answers);

		for (const found_answer of found_answers) {
			let found_entry_in_store = Object.entries(question_mapping).filter(
				(a) => a[1] == found_answer.question_id
			);
			if (found_entry_in_store.length == 0) {
				throw new Error(
					"No store was found for database question_id of: " +
						found_answer.question_id
				);
			}
			store[found_entry_in_store[0][0] as question_keys].set({
				latlng: {
					lat: found_answer.lat,
					lng: found_answer.lng,
				},
				political_address_components:
					found_answer.political_address_components,
			});
		}

		listen_for_updates();
	}
</script>

<QuestionComponent
	questionStore={store.q1_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where were you born?"
/>
<QuestionComponent
	questionStore={store.q2_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your mother born?"
/>
<QuestionComponent
	questionStore={store.q3_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your father born?"
/>
<QuestionComponent
	questionStore={store.q4_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your grandma on your mother's side born?"
/>
<QuestionComponent
	questionStore={store.q5_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your grandpa on your mother's side born?"
/>
<QuestionComponent
	questionStore={store.q6_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your grandma on your father's side born?"
/>
<QuestionComponent
	questionStore={store.q7_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your grandpa on your father's side born?"
/>
