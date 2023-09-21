<script lang="ts">
    import AutoCompleteDropdown from "$lib/components/AutoCompleteDropdown.svelte";
    import MapChooser from "$lib/components/MapChooser.svelte";
	import type { QuestionResults } from "$lib/types";
	import type { Writable } from "svelte/store";
	
    export let service : google.maps.places.AutocompleteService;
    export let geocoder : google.maps.Geocoder;
    export let questionStore : Writable<QuestionResults | undefined>;
    export let prompt : string;
</script>

<section>
    <h2>{prompt}</h2>

    <AutoCompleteDropdown service={service} geocoder={geocoder} chosenPlaceStore={questionStore}/>

    <MapChooser chosenPlaceStore={questionStore} />
</section>