<script lang="ts">
    import { q1_results, q2_results } from "$lib/store";
	import QuestionComponent from "$lib/components/QuestionComponent.svelte";
    
    export let service : google.maps.places.AutocompleteService;
    export let geocoder : google.maps.Geocoder;
</script>

<QuestionComponent questionStore={q1_results} geocoder={geocoder} service={service} prompt="Where were you born?" />
<QuestionComponent questionStore={q2_results} geocoder={geocoder} service={service} prompt="Where was your mom born?" />