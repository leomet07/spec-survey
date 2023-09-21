<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";
	import { q1_results, q2_results } from "$lib/store";
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

	q1_results.subscribe(async (q1) => {
		questionUpdater(q1, "A");
	});
</script>

<QuestionComponent
	questionStore={q1_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where were you born?"
/>
<QuestionComponent
	questionStore={q2_results}
	{geocoder}
	{autoCompleteService}
	prompt="Where was your mom born?"
/>
