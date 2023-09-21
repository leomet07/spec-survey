<script lang="ts">
    import { q1_results, q2_results } from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";
    
    export let autoCompleteService : google.maps.places.AutocompleteService;
    export let geocoder : google.maps.Geocoder;
</script>

<QuestionComponent questionStore={q1_results} geocoder={geocoder} autoCompleteService={autoCompleteService} prompt="Where were you born?" />
<QuestionComponent questionStore={q2_results} geocoder={geocoder} autoCompleteService={autoCompleteService} prompt="Where was your mom born?" />