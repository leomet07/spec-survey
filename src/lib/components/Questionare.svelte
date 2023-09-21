<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";
	import * as store from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";
	import { ClientResponseError } from "pocketbase";
	import type { QuestionResults } from "$lib/types";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;

    async function questionUpdater(questionStore : QuestionResults | undefined, question_id : string){
        if (!$currentUser || !questionStore) {
			return;
		}

        let found;
        try {
            found = await pb.collection("questions").getFirstListItem(`question_id="${question_id}"`);
        } catch (e: any){
            if (e.status != 404 && !(e instanceof ClientResponseError) ){ // if 404, just return false
                throw e;
            }
        }

        const data = {
            lat : questionStore.latlng.lat,
            lng : questionStore.latlng.lat,
            political_address_components : questionStore.political_address_components,
            parent_user : $currentUser.id,
            question_id : question_id
        }
        
        if (found){
            const deleted = await pb.collection("questions").delete(found.id);
        }
        const created = await pb.collection("questions").create(data);
    }

	store.q1_results.subscribe(async (q1) => {
		questionUpdater(q1, "A");
	});
	store.q2_results.subscribe(async (q2) => {
		questionUpdater(q2, "B");
	});
	store.q3_results.subscribe(async (q3) => {
		questionUpdater(q3, "C");
	});
	store.q4_results.subscribe(async (q4) => {
		questionUpdater(q4, "D");
	});
	store.q5_results.subscribe(async (q5) => {
		questionUpdater(q5, "E");
	});
	store.q6_results.subscribe(async (q6) => {
		questionUpdater(q6, "F");
	});
	store.q7_results.subscribe(async (q7) => {
		questionUpdater(q7, "G");
	});
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
