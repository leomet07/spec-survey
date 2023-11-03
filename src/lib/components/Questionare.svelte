<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";
	import * as store from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";
	import { ClientResponseError } from "pocketbase";
	import type {
		DBQuestion,
		Ethnicity,
		EthnicityQuestionResults,
		QuestionResults,
		UserEthnicityDBEntry,
	} from "$lib/types";
	import EthnicityChooser from "./EthnicityChooser.svelte";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;

	async function questionUpdater(
		questionStore: QuestionResults | undefined,
		question_id: string
	) {
		if (!$currentUser) {
			return;
		}

		const matched_to_on_load = found_map_answers?.filter(
			(v: any) => v.question_id == question_id
		);

		if (
			questionStore &&
			matched_to_on_load &&
			matched_to_on_load.length > 0 &&
			matched_to_on_load[0]?.lat == questionStore?.latlng.lat &&
			matched_to_on_load[0]?.lng == questionStore?.latlng.lng
		) {
			// nothing has changed from the initial markers from db, do not do any db stuff
			return;
		}

		let found_questions: DBQuestion[] | undefined;
		try {
			found_questions = await pb
				.collection("questions")
				.getFullList({ filter: `question_id="${question_id}"` });
		} catch (e: any) {
			if (e.status != 404 && !(e instanceof ClientResponseError)) {
				// if 404, just return false
				throw e;
			}
		}

		if (found_questions && found_questions.length > 0) {
			for (const question of found_questions) {
				if (
					question.lat == questionStore?.latlng.lat &&
					question.lng == questionStore?.latlng.lng
				) {
					continue;
				}
				const isDeleted = await pb
					.collection("questions")
					.delete(question.id);
				if (!isDeleted) {
					throw new Error("Could not delete successfully.");
				}
			}
		}

		if (!questionStore) {
			return;
		}

		const data = {
			lat: questionStore.latlng.lat,
			lng: questionStore.latlng.lng,
			political_address_components:
				questionStore.political_address_components,
			parent_user: $currentUser.id,
			question_id: question_id,
		};

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

		store.ethnicity_results.subscribe(async (new_ethnicities) => {
			if (!$currentUser) {
				return;
			}

			if (found_ethnicity_answers) {
				let is_same =
					new_ethnicities?.length == found_ethnicity_answers.length &&
					new_ethnicities?.every(function (element, index) {
						// @ts-ignore
						return element === found_ethnicity_answers[index];
					});
				if (is_same) {
					return;
				}
			}

			let found_user_ethnicities = await pb
				.collection("user_ethnicities")
				.getFullList<UserEthnicityDBEntry>(); // automatically filtered because rule in db

			for (const found_user_ethnicity of found_user_ethnicities) {
				const isDeleted = await pb
					.collection("user_ethnicities")
					.delete(found_user_ethnicity.id);
				if (!isDeleted) {
					throw new Error(
						"Could not delete user ethnicity entry successfully."
					);
				}
			}

			if (!new_ethnicities) {
				return;
			}

			for (const newuser_ethnicity of new_ethnicities) {
				const created = await pb
					.collection("user_ethnicities")
					.create<UserEthnicityDBEntry>({
						parent_user: $currentUser.id,
						ethnicity: newuser_ethnicity.id,
					});

				console.log("Created: ", created);
			}
		});
	}

	currentUser.subscribe(async (curr_user) => {
		if (curr_user?.id && !curr_user.hasSubmittedSurvey) {
			setTimeout(load_questions, 1);
		}
	});

	let found_map_answers: DBQuestion[] | undefined;
	let found_ethnicity_answers: EthnicityQuestionResults | undefined;

	async function load_questions() {
		// Load map questions
		found_map_answers = await pb
			.collection("questions")
			.getFullList<DBQuestion>({ requestKey: "load_questions" });

		for (const found_answer of found_map_answers) {
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

		// Load ethnicity questions
		let db_found_ethnicity_answers = await pb
			.collection("user_ethnicities")
			.getFullList<UserEthnicityDBEntry>({ expand: "ethnicity" }); // automatically filtered because rule in db

		console.log("On load: ", db_found_ethnicity_answers);
		found_ethnicity_answers = db_found_ethnicity_answers.map(function (v) {
			return v?.expand?.ethnicity as Ethnicity;
		});
		console.log("On parse: ", found_ethnicity_answers);
		store.ethnicity_results.set(found_ethnicity_answers);

		listen_for_updates();
	}

	async function submitSurvey() {
		const current_user_id = $currentUser?.id;
		if (!current_user_id) {
			console.log("Not logged in, current user_id not found!");
		}
		await pb.collection("users").update(current_user_id, {
			hasSubmittedSurvey: true,
		});
	}

	async function unSubmitSurvey() {
		const current_user_id = $currentUser?.id;
		if (!current_user_id) {
			console.log("Not logged in, current user_id not found!");
		}
		await pb.collection("users").update(current_user_id, {
			hasSubmittedSurvey: false,
		});
	}
</script>

{#if !$currentUser?.hasSubmittedSurvey}
	<EthnicityChooser
		prompt={"What ethnicities do you identify with?"}
		chosenEthnicities={store.ethnicity_results}
	/>
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

	<button on:click={submitSurvey}>Submit Survey</button>
{:else}
	<h2>Thanks for submitting the survey!</h2>
	<button on:click={unSubmitSurvey} class="secondary">
		Unsubmit Survey
	</button>
{/if}
