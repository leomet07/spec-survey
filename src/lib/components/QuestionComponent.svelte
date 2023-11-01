<script lang="ts">
	import AutoCompleteDropdown from "$lib/components/AutoCompleteDropdown.svelte";
	import MapChooser from "$lib/components/MapChooser.svelte";
	import type { QuestionResults } from "$lib/types";
	import type { Writable } from "svelte/store";

	export let autoCompleteService: google.maps.places.AutocompleteService;
	export let geocoder: google.maps.Geocoder;
	export let questionStore: Writable<QuestionResults | undefined>;
	export let prompt: string;

	function getAddressFromPoliticalAddressComponents(
		components: google.maps.GeocoderAddressComponent[]
	): string {
		let ret = "";
		let state = "";
		let country = "";
		for (let comp of components) {
			if (comp.types.some((v) => v == "administrative_area_level_1")) {
				state = comp.long_name;
			}
			if (comp.types.some((v) => v == "country")) {
				country = comp.long_name;
			}
		}
		return state + ", " + country;
	}

	function formatNumber(n: number): number {
		return Math.round(n * 10000) / 10000;
	}
</script>

<section>
	<h2>{prompt}</h2>

	{#if $questionStore?.political_address_components && $questionStore?.political_address_components.length > 0}
		<p>
			{getAddressFromPoliticalAddressComponents(
				$questionStore.political_address_components
			)}
		</p>
	{:else if $questionStore?.latlng}
		<p>
			Selected location at ({formatNumber($questionStore.latlng.lat)},
			{formatNumber($questionStore.latlng.lng)})
		</p>
	{/if}

	<AutoCompleteDropdown
		{autoCompleteService}
		{geocoder}
		chosenPlaceStore={questionStore}
	/>

	<MapChooser chosenPlaceStore={questionStore} {geocoder} />
</section>
