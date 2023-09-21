<script lang="ts">
	import { pb, currentUser } from "$lib/pocketbase";
	import { q1_results, q2_results } from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";
	import { ClientResponseError } from "pocketbase";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;

	q1_results.subscribe(async (q1) => {
		if (!$currentUser || !q1) {
			return;
		}
		console.log("Q1 change: ");
		console.log(q1);

        let found;
        try {
            found = await pb.collection("questions").getFirstListItem(`question_id="A"`);
        } catch (e: any){
            if (e.status != 404 && !(e instanceof ClientResponseError) ){ // if 404, just return false
                throw e;
            }
        }

        const data = {
            lat : q1.latlng.lat,
            lng : q1.latlng.lat,
            political_address_components : q1.political_address_components,
            parent_user : $currentUser.id,
            question_id : "A"
        }
        
        if (found){
            const deleted = await pb.collection("questions").delete(found.id);
        }
        const created = await pb.collection("questions").create(data);

        console.log("Does exist? ", !!found);
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
